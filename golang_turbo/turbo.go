package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"log"
	"math/rand"
	"net"
	"net/url"
	"time"

	"github.com/valyala/fasthttp"
)

type BearerTokens struct {
	Tokens []string `json:"tokens"`
}

func queueSnipe(username string, bearerTokens []string, startTime int64, stopTime int64, proxyURL *url.URL, numWorkers int) {
	dialer := &net.Dialer{
		Timeout:   time.Second * 5,
		KeepAlive: time.Second * 10,
	}

	client := &fasthttp.Client{
		Dial: func(addr string) (net.Conn, error) {
			return dialer.Dial("tcp", proxyURL.Host)
		},
		MaxConnsPerHost: numWorkers,
	}

	urlBuf := bytes.NewBufferString("https://api.minecraftservices.com/minecraft/profile/")

	workerCh := make(chan struct{}, numWorkers)

	for time.Now().Unix() < startTime {
		time.Sleep(time.Millisecond * 50)
	}

	for time.Now().Unix() < stopTime {
		token := bearerTokens[rand.Intn(len(bearerTokens))]

		workerCh <- struct{}{}
		go func() {
			defer func() {
				<-workerCh
			}()

			req := fasthttp.AcquireRequest()
			resp := fasthttp.AcquireResponse()

			defer func() {
				fasthttp.ReleaseRequest(req)
				fasthttp.ReleaseResponse(resp)
			}()

			req.Header.SetMethod("POST")
			req.SetRequestURIBytes(urlBuf.Bytes())

			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("profileName", username)

			if err := client.DoTimeout(req, resp, 0); err != nil {
				log.Printf("Error occurred: %s\n", err)
			}
		}()
	}
}

func main() {
	usernamePtr := flag.String("username", "", "Minecraft username")
	startTimePtr := flag.Int64("start-time", 0, "Unix timestamp to start sniping")
	stopTimePtr := flag.Int64("stop-time", 0, "Unix timestamp to stop sniping")
	bearerTokensPtr := flag.String("tokens", "", "JSON array of bearer tokens")
	proxyURLPtr := flag.String("proxy-url", "", "Proxy URL")
	threadsPtr := flag.Int("threads", 1, "Number of concurrent connections")

	flag.Parse()

	if *usernamePtr == "" {
		log.Fatal("Username cannot be empty")
	}

	if *startTimePtr == 0 {
		log.Fatal("Start time must be specified")
	}

	if *stopTimePtr == 0 {
		log.Fatal("Stop time must be specified")
	}

	bearerTokens := BearerTokens{}
	err := json.Unmarshal([]byte(*bearerTokensPtr), &bearerTokens)
	if err != nil {
		log.Fatalf("Error unmarshalling bearer tokens: %s", err)
	}

	proxyURL, err := url.Parse(*proxyURLPtr)
	if err != nil {
		log.Fatalf("Error parsing proxy URL: %s", err)
	}

	queueSnipe(*usernamePtr, bearerTokens.Tokens, *startTimePtr, *stopTimePtr, proxyURL, *threadsPtr)
}
