package library

import (
	"net/http"
	"time"

	"github.com/DataObserve/datav/query/internal/user"
	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/common"
	"github.com/DataObserve/datav/query/pkg/db"
	"github.com/DataObserve/datav/query/pkg/e"
	"github.com/DataObserve/datav/query/pkg/models"
	"github.com/DataObserve/datav/query/pkg/utils"
	"github.com/gin-gonic/gin"
)

var logger = colorlog.RootLogger.New("logger", "library element")

func AddLibraryElement(c *gin.Context) {
	u := user.CurrentUser(c)
	req := &models.LibraryElement{}
	err := c.Bind(&req)
	if err != nil {
		logger.Warn("invalid request in saving dashboard", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}
	req.ID = utils.GenerateShortUID()
	req.OwnBy = u.Id
	req.Type = req.Model.Get("type").MustString()
	jsonData, err := req.Model.Encode()
	if err != nil {
		logger.Warn("decode library element model error", "error", err)
		c.JSON(400, common.RespError(e.ParamInvalid))
		return
	}
	_, err = db.Conn.ExecContext(
		c.Request.Context(),
		"INSERT INTO library_element (id, name, description, type, model,owned_by,created,updated) VALUES (?,?,?,?,?,?,?,?)",
		req.ID, req.Name, req.Description, req.Type, jsonData, req.OwnBy, time.Now(), time.Now(),
	)
	if err != nil {
		logger.Warn("add library element error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}
	c.JSON(http.StatusOK, common.RespSuccess(models.LibraryElement{
		ID:          req.ID,
		Description: req.Description,
		OwnBy:       req.OwnBy,
		Name:        req.Name,
		Type:        req.Type,
		Model:       req.Model,
	}))
}

func GetLibraryElements(c *gin.Context) {
	elements := make([]*models.LibraryElement, 0)
	rows, err := db.Conn.QueryContext(c.Request.Context(), `SELECT id, name, description, type, model, owned_by,created FROM library_element`)
	if err != nil {
		logger.Warn("query library elements error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}
	defer rows.Close()
	for rows.Next() {
		ele := models.LibraryElement{}
		err = rows.Scan(&ele.ID, &ele.Name, &ele.Description, &ele.Type, &ele.Model, &ele.OwnBy, &ele.Created, &ele.Updated)
		if err != nil {
			logger.Warn("get library elements scan error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
			return
		}
		elements = append(elements, &ele)
	}
	c.JSON(http.StatusOK, common.RespSuccess(elements))
}

func DeleteLibraryElement(c *gin.Context) {
	id := c.Param("id")
	element, err := models.QueryLibraryElementById(c.Request.Context(), id)
	if err != nil {
		logger.Warn("query library element error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}
	if element == nil {
		c.JSON(http.StatusNotFound, common.RespError(e.NotFound))
		return
	}
	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM library_element WHERE ID = ?", id)
	if err != nil {
		logger.Warn("delete library element error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}
	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
