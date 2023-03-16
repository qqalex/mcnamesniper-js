// Send api requests to Microsoft's Minecraft API to create a new profile on a Microsoft gamepass account.
// Using Golang's fast http to send requests as fast as possible.
// We are using rotating proxies in the format "username:password@url"; the proxies can only send as many requests "concurrently".
// Currently we can only send 100 requests "concurrently".
// Since we are using proxies don't worry about getting banned, we want to be able to send as many requests as possible.

// We are writing a name sniper so speed is `critical` to beat out the other name snipers.

// Functions
// ** Load Bearer tokens
// ** Send requests
//

package main

import (
	"bufio"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sync"
)

func sendRequests(wg *sync.WaitGroup, client *http.Client, url string, bearerToken string) {
	defer wg.Done()
	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearerToken))
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()
}

func main() {
	maxThreads := 100
	proxyUrl, _ := url.Parse("http://minecat:5d86f4-e1a8a9-a211fd-5f7e38-23741a@usa.rotating.proxyrack.net:9000")
	var bearerTokens []string
	file, err := os.Open("bearer_tokens.txt")
	if err != nil {
		fmt.Printf("Error opening bearer tokens file: %v\n", err)
		return
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		bearerTokens = append(bearerTokens, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		fmt.Printf("Error reading bearer tokens file: %v\n", err)
		return
	}
	tr := &http.Transport{
		Proxy: http.ProxyURL(proxyUrl),
	}
	client := &http.Client{Transport: tr}
	wg := sync.WaitGroup{}
	for i := 0; i > -1; i++ {
		wg.Add(1)
		tokenIndex := i % len(bearerTokens)
		go sendRequests(&wg, client, "https://api.minecraftservices.com/minecraft/profile/", bearerTokens[tokenIndex])
		if i%maxThreads == 0 {
			wg.Wait()
		}
	}
	wg.Wait()
	fmt.Println("Done sending requests.")
}
