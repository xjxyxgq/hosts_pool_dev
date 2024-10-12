package services

import (
	"io"
	"log"
	"net/http"
	"time"

	"crypto/tls"

	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
	"gopkg.in/mail.v2"
)

type EmailService struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUser     string
	SMTPPassword string
}

type EmailRequest struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Content string `json:"content"`
}

func (s *EmailService) SendEmail(c *gin.Context) {
	var request struct {
		To      string `json:"to"`
		Subject string `json:"subject"`
		Content string `json:"content"`
	}

	if err := c.BindJSON(&request); err != nil {
		log.Println("Failed to bind JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	log.Printf("Attempting to send email to: %s, subject: %s", request.To, request.Subject)

	m := mail.NewMessage()
	m.SetHeader("From", s.SMTPUser)
	m.SetHeader("To", request.To)
	m.SetHeader("Subject", request.Subject)
	m.SetBody("text/html", request.Content)

	d := mail.NewDialer(s.SMTPHost, s.SMTPPort, s.SMTPUser, s.SMTPPassword)
	d.SSL = true
	d.Timeout = 5 * time.Second

	if err := d.DialAndSend(m); err != nil {
		log.Printf("Error sending email: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	log.Println("Email sent successfully")
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (s *EmailService) SendEmailWithAttachment(to, subject, body string, attachment []byte) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.SMTPUser)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	m.Attach("screenshot.png", gomail.SetCopyFunc(func(w io.Writer) error {
		_, err := w.Write(attachment)
		return err
	}))

	d := gomail.NewDialer(s.SMTPHost, s.SMTPPort, s.SMTPUser, s.SMTPPassword)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	return d.DialAndSend(m)
}
