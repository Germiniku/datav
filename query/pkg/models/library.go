package models

import (
	"context"
	"database/sql"
	"time"

	"github.com/DataObserve/datav/query/pkg/db"
	"github.com/DataObserve/datav/query/pkg/utils/simplejson"
)

type LibraryElement struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Type        string           `json:"type"`
	OwnBy       int64            `json:"own_by"`
	Model       *simplejson.Json `json:"model"`
	Created     *time.Time       `json:"created,omitempty"`
	Updated     *time.Time       `json:"updated,omitempty"`
}

func QueryLibraryElementById(ctx context.Context, id string) (*LibraryElement, error) {
	element := &LibraryElement{}
	err := db.Conn.QueryRowContext(ctx, "SELECT id,name,description,type,own_by,model FROM library_element WHERE id = ?", id).Scan(
		&element.ID, &element.Name, &element.Description, &element.Type, &element.OwnBy, &element.Model)
	if err != nil && err != sql.ErrNoRows {
		return element, err
	}
	if element.ID == "" {
		return nil, nil
	}
	return element, nil
}
