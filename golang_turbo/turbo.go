package main

import (
	"encoding/json"
	"flag"
	"log"
	"math/rand"
	"net"
	"net/url"
	"os"
	"time"

	"github.com/valyala/fasthttp"
)

type BearerTokens struct {
	Tokens []string `json:"tokens"`
}

func queueSnipe(username string, bearerTokens []string, startTime int64, stopTime int64, proxyURL *url.URL) {
	dialer := &net.Dialer{
		Timeout:   time.Second * 5,
		KeepAlive: time.Second * 10,
	}

	client := &fasthttp.Client{
		Dial: func(addr string) (net.Conn, error) {
			return dialer.Dial("tcp", proxyURL.Host)
		},
	}

	url := "https://api.minecraftservices.com/minecraft/profile/"

	for time.Now().Unix() < startTime {
		time.Sleep(time.Millisecond * 50)
	}

	for time.Now().Unix() < stopTime {
		go func() {
			token := bearerTokens[rand.Intn(len(bearerTokens))]

			req := fasthttp.AcquireRequest()
			defer fasthttp.ReleaseRequest(req)

			req.Header.SetMethod("POST")
			req.Header.SetRequestURI(url)

			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("profileName", username)

			resp := fasthttp.AcquireResponse()
			defer fasthttp.ReleaseResponse(resp)

			if err := client.DoTimeout(req, resp, time.Second*5); err != nil {
				log.Printf("Error occurred: %s\n", err)
			}
		}()

		time.Sleep(time.Second * 10)
	}
}

func main() {
	usernamePtr := flag.String("username", "", "Minecraft username")
	startTimePtr := flag.Int64("start-time", 0, "Start time as Unix time")
	stopTimePtr := flag.Int64("stop-time", 0, "Stop time as Unix time")
	proxyURLPtr := flag.String("proxy-url", "", "Proxy URL in the format 'http://username:password@website.com:yourproxyport'")
	bearerTokensFilePtr := flag.String("bearer-tokens-file", "", "Path to JSON file containing bearer tokens")

	flag.Parse()

	// Check if required arguments are missing
	if *usernamePtr == "" || *startTimePtr == 0 || *stopTimePtr == 0 || *proxyURLPtr == "" || *bearerTokensFilePtr == "" {
		flag.Usage()
		os.Exit(1)
	}

	// Parse start time and stop time
	startTime := *startTimePtr
	stopTime := *stopTimePtr

	// Parse proxy URL
	proxyURL, err := url.Parse(*proxyURLPtr)
	if err != nil {
		log.Fatalf("Error parsing proxy URL: %s", err)
	}

	// Read bearer tokens from JSON file
	bearerTokensFile, err := os.Open(*bearerTokensFilePtr)
	if err != nil {
		log.Fatalf("Error opening bearer tokens file: %s", err)
	}
	defer bearerTokensFile.Close()

	var bearerTokens BearerTokens
	err = json.NewDecoder(bearerTokensFile).Decode(&bearerTokens)
	if err != nil {
		log.Fatalf("Error decoding bearer tokens file: %s", err)
	}

	queueSnipe(*usernamePtr, bearerTokens.Tokens, startTime, stopTime, proxyURL)
}
