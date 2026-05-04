package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// ─── Message ─────────────────────────────────────────────────────────────────

type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// Message types (Server → Client)
const (
	MsgNewOrder           = "NEW_ORDER"
	MsgOrderStatusChanged = "ORDER_STATUS_CHANGED"
	MsgSessionStarted     = "SESSION_STARTED"
	MsgSessionEnded       = "SESSION_ENDED"
	MsgPaymentConfirmed   = "PAYMENT_CONFIRMED"
)

// ─── Client ──────────────────────────────────────────────────────────────────

type Client struct {
	Hub    *Hub
	Conn   *websocket.Conn
	Send   chan []byte
	UserID string
	Role   string
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()
	for msg := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}

// ─── Hub ─────────────────────────────────────────────────────────────────────

type Hub struct {
	Clients    map[*Client]bool
	Broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan []byte, 256),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
			log.Printf("WS client connected: %s", client.UserID)

		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
				log.Printf("WS client disconnected: %s", client.UserID)
			}

		case message := <-h.Broadcast:
			for client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
		}
	}
}

// BroadcastMessage sends a typed message to all connected clients
func (h *Hub) BroadcastMessage(msgType string, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}
	msg := Message{Type: msgType, Payload: data}
	raw, err := json.Marshal(msg)
	if err != nil {
		return
	}
	h.Broadcast <- raw
}

// ─── Upgrader & ServeWS ──────────────────────────────────────────────────────

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: restrict in production
	},
}

func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WS upgrade error: %v", err)
		return
	}

	// TODO: parse JWT from query param for user identification
	userID := r.URL.Query().Get("user_id")
	role := r.URL.Query().Get("role")

	client := &Client{
		Hub:    hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserID: userID,
		Role:   role,
	}

	hub.Register <- client
	go client.WritePump()
	go client.ReadPump()
}
