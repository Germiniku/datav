package user

import (
	"database/sql"
	"strconv"

	"github.com/MyStarship/starship/backend/pkg/config"

	"github.com/MyStarship/starship/backend/pkg/models"

	// "fmt"
	"time"

	"github.com/MyStarship/starship/backend/pkg/db"
	"github.com/gin-gonic/gin"
)

func storeSession(s *models.Session) error {
	_, err := db.Conn.Exec(`INSERT INTO  sessions (user_id,sid) VALUES (?,?)`, s.User.Id, s.Token)
	if err != nil {
		logger.Warn("store session error", "error", err)
		return err
	}
	return nil
}

func loadSession(sid string) *models.Session {
	var userid int64
	err := db.Conn.QueryRow(`SELECT user_id FROM sessions WHERE sid=?`, sid).Scan(&userid)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query session error", "error", err)
		}
		return nil
	}

	user, err := models.QueryUserById(userid)
	if err != nil {
		logger.Warn("query user error", "error", err)
		return nil
	}

	if user.Id == 0 {
		return nil
	}

	return &models.Session{
		Token: sid,
		User:  user,
	}
}

func deleteSession(sid string) {
	_, err := db.Conn.Exec(`DELETE FROM sessions  WHERE sid=?`, sid)
	if err != nil {
		logger.Warn("delete session error", "error", err)
	}
}

func deleteSessionByUserId(uid int64) {
	_, err := db.Conn.Exec(`DELETE FROM sessions  WHERE user_id=?`, uid)
	if err != nil {
		logger.Warn("delete session error", "error", err)
	}
}

func getToken(c *gin.Context) string {
	return c.Request.Header.Get("X-Token")
}

func CurrentUser(c *gin.Context) *models.User {
	token := getToken(c)
	createTime, _ := strconv.ParseInt(token, 10, 64)
	if createTime != 0 {
		// check whether token is expired
		if (time.Now().Unix() - createTime/1e9) > config.Data.User.SessionExpire {
			deleteSession(token)
			return nil
		}
	}

	sess := loadSession(token)
	if sess == nil {
		// 用户未登陆或者session失效
		return nil
	}

	return sess.User
}

func CurrentUserId(c *gin.Context) int64 {
	user := CurrentUser(c)
	return user.Id
}
