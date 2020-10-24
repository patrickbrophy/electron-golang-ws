package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:8080", "http service address")

var upgrader = websocket.Upgrader{}

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade: ", err)
		return
	}
	defer c.Close()

	// read messages from client forever
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Print("read", err)
			break
		}
		// log message recieved
		log.Printf("recv: %s", message)
		// write message back to client
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func kill(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade: ", err)
		return
	}
	defer c.Close()

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Print("read", err)
			break
		}
		// log message recieved
		log.Printf("recv: %s", message)
		if message != nil {
			byteMessage := []byte("killed server")
			err = c.WriteMessage(mt, byteMessage)
			if err != nil {
				log.Println("write:", err)
				break
			}
			os.Exit(666)
		}
		// write message back to client

	}

}

func main() {
	defer os.Exit(666)
	// removes CORS error
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/echo", echo)
	http.HandleFunc("/kill", kill)
	log.Print("Server started on http://localhost:8080/echo")
	fmt.Println("go server started")
	log.Fatal(http.ListenAndServe(*addr, nil))
}
