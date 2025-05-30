#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <filename>"
  exit 1
fi

filepath="$1"

if [ ! -f "$filepath" ]; then
  echo "Error: File '$filepath' not found."
  exit 1
fi

# Read the first 6 characters of the file, as this is the maximum needed for "<span>"
prefix=$(head -c 6 "$filepath")

# Extract specific length prefixes for matching
prefix1="${prefix:0:1}"
# prefix4 is no longer needed with wildcard matching for HTML tags
# The comment about prefix6 can also be removed as prefix itself is used.

classification_result=""

if [[ "$prefix" == "<h1>"* || "$prefix" == "<h2>"* || "$prefix" == "<h3>"* ]]; then
  classification_result="page"
elif [[ "$prefix" == "<p>"* || "$prefix" == "<span>"* || "$prefix" == "<div>"* || "$prefix" == "<hr"* || "$prefix" == "<a hre"* ]]; then
  classification_result="html"
elif [[ "$prefix1" == "[" || "$prefix1" == "{" ]]; then
  classification_result="json"
elif [[ "$prefix1" =~ ^[[:alnum:]] ]]; then # Check if the first character is alphanumeric
  classification_result="text"
else
  classification_result="text"
fi

# Print output message
echo "$classification_result"
