/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package utils

import (
	"log"
	"os"
	"path/filepath"
)

func GetBaseDir() string {
	env := os.Getenv("ENV")
	if env != "dev" {
		return filepath.Dir(os.Args[0])
	} else {
		return "./"
	}
}

func Check(err error) {
	if err != nil {
		log.Fatal(err)
		panic(err)
	}
}
