package main

import (
	"encoding/json"
	"net/http"

	"github.com/snowflake"
	"github.com/snowflake/awsutil"
)

var sf *Snowflake.Snowflake

func init() {
	var st Snowflake.Settings
	st.MachineID = awsutil.AmazonEC2MachineID
	sf = Snowflake.NewSnowflake(st)
	if sf == nil {
		panic("Snowflake not created")
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	id, err := sf.NextID()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	body, err := json.Marshal(Snowflake.Decompose(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header()["Content-Type"] = []string{"application/json; charset=utf-8"}
	w.Write(body)
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}
