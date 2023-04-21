package common

import "github.com/MyStarship/starship/backend/pkg/e"

type Resp struct {
	Status  string      `json:"status"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

func RespSuccess(data interface{}) *Resp {
	r := &Resp{}
	r.Status = Success
	r.Data = data

	return r
}

func RespError(msg string) *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = msg

	return r
}

func RespErrorWithData(msg string, data interface{}) *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = msg
	r.Data = data
	return r
}

func RespInternalError() *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = e.Internal

	return r
}
