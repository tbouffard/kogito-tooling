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

package config

import (
	"embed"
	"log"

	"gopkg.in/yaml.v2"
)

//go:embed config.yaml
var f embed.FS

type Config struct {
	App struct {
		Version string `yaml:"version"`
	} `yaml:"app"`
	Proxy struct {
		IP                 string `yaml:"ip"`
		Port               int    `yaml:"port"`
		InsecureSkipVerify bool   `yaml:"insecureSkipVerify"`
	} `yaml:"proxy"`
	Modeler struct {
		Link string `yaml:"link"`
	} `yaml:"modeler"`
}

func (c *Config) GetConfig() *Config {

	yamlFile, err := f.ReadFile("config.yaml")
	if err != nil {
		log.Printf("yamlFile.Get err   #%v ", err)
	}
	err = yaml.Unmarshal(yamlFile, c)
	if err != nil {
		log.Fatalf("Unmarshal: %v", err)
	}

	return c
}
