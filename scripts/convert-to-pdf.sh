#!/usr/bin/env bash
# Copyright 2021 Google LLC.
# SPDX-License-Identifier: Apache-2.0

set -e

cwd=`pwd`
script_folder=`cd $(dirname $0) && pwd`

html_files=("$@")

for file in "${html_files[@]}"
do
  pdf_file="${file%.*}.pdf"

  if [ -f "$file" ]
  then
    if [ -f "$pdf_file" ]
    then
      echo -e "\033[1;30m$pdf_file already exists, skipping\033[0m"
    else
      command="npx electron-pdf \"$file\" \"$pdf_file\" -w 100"

      echo "$command"
      eval "$command"
      echo "$pdf_file"
    fi
  else
    echo "$file not found"
    exit 1
  fi

done
