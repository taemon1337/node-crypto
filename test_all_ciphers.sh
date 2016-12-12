#!/bin/bash

for cipher in $(cat ciphers.txt); do
  result=$(node cli.js --cipher $cipher test)
  [[ $result =~ "PASS" ]] && echo $cipher >> passed_ciphers.txt
done

