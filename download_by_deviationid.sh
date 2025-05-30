#!/bin/bash

# Create results2 directory if it doesn't exist
mkdir -p results-img

# Download DeviantArt submission pages by deviationId from all_entries.jsonl using dl_gruser.sh
while IFS= read -r line; do
    DEVIATION_ID=$(echo "$line" | jq -r '.deviationId')
    # Skip if deviationId is null or empty
    if [[ -z "$DEVIATION_ID" || "$DEVIATION_ID" == "null" ]]; then
        continue
    fi
    # Use DEVIATION_ID as both deviationId and current_id
    ./dl_gruser.sh "$DEVIATION_ID" "$DEVIATION_ID"

    # sleep $((RANDOM % 3 + 1))
    zselect -t $(( (RANDOM % 191) + 10 ))

    image_url=$(node build-image-url.mjs "results-gruser/gruser_${DEVIATION_ID}.json")

    # Stop if image_url is null or empty or contains "ERROR"
    if [[ -z "$image_url" || "$image_url" == "null" || "$image_url" == *"ERROR"* ]]; then
        echo "Stopping download for deviationId $DEVIATION_ID due to invalid image URL: $image_url"
        exit -1
    fi

    echo "Image URL for deviationId $DEVIATION_ID: $image_url"
    curl -L "$image_url" -o "results-img/${DEVIATION_ID}.jpg" \
        -H 'accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' \
        -H 'accept-language: en-US,en;q=0.9,fi;q=0.8,sv;q=0.7,de;q=0.6,it;q=0.5,fr;q=0.4' \
        -H 'cache-control: no-cache' \
        -H 'pragma: no-cache' \
        -H 'referer: https://www.deviantart.com/' \
        -H 'sec-ch-ua: "Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"' \
        -H 'sec-ch-ua-mobile: ?0' \
        -H 'sec-ch-ua-platform: "macOS"' \
        -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36' 
        
    # sleep $((RANDOM % 3 + 1))
    zselect -t $(( (RANDOM % 191) + 10 ))
done < image_entries.jsonl
