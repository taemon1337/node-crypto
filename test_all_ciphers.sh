#!/bin/bash

for cipher in $(cat ciphers.txt); do
  node cli.js --cipher $cipher test
done

