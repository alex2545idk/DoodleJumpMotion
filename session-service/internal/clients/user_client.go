package clients

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type UserClient struct {
    BaseURL   string
    AdminJWT  string
    InternalToken string
}

type UserResponse struct {
    ID       uint `json:"id"`
    CupCount int  `json:"cup_count"`
    Role     string `json:"role"`
}

func NewUserClient() *UserClient {
    return &UserClient{
        BaseURL:        os.Getenv("USER_SERVICE_URL"),            // url user-service http://localhost:8080
        AdminJWT:       os.Getenv("ADMIN_JWT_TOKEN"),             // admin jwt token
        InternalToken:  os.Getenv("INTERNAL_API_TOKEN"),          // super_secret_token_123
    }
}

// ---------------- GET USER ------------------

func (c *UserClient) GetUser(id uint) (*UserResponse, error) {
    url := fmt.Sprintf("%s/users/%d", c.BaseURL, id)

    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Set("Authorization", "Bearer "+c.AdminJWT)

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        return nil, fmt.Errorf("user-service returned %d", resp.StatusCode)
    }

    var data UserResponse
    if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
        return nil, err
    }

    return &data, nil
}

// ---------------- CHANGE CUPS ------------------

func (c *UserClient) ChangeCups(id uint, diff int) error {
    url := fmt.Sprintf("%s/users/%d/cups", c.BaseURL, id)

    body := map[string]int{"cup_change": diff}
    jsonBody, _ := json.Marshal(body)

    req, _ := http.NewRequest("PUT", url, bytes.NewBuffer(jsonBody))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("INTERNAL_API_TOKEN", c.InternalToken)
	req.Header.Set("Authorization", "Bearer "+c.AdminJWT)

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        respBody, _ := io.ReadAll(resp.Body)
        fmt.Println("User Service response:", string(respBody))
        return fmt.Errorf("failed to update cups, status %d", resp.StatusCode)
    }

    return nil
}