#!/bin/bash

# Usage: ./dl_gruser.sh <deviationid> <current_id>
# Example: ./dl_gruser.sh 1199528204 1197896557

if [ $# -lt 2 ]; then
  echo "Usage: $0 <deviationid> <current_id>"
  exit 1
fi

DEVIATION_ID="$1"
CURRENT_ID="$2"
USERNAME="sheikkinen"
CSRF_TOKEN="pT1DxTNhAGSs8pna.sx0xfp.D1LEsSlODfIb3t925ssYy6xEe_YwnvBu6UH0m_wwbFU"

URL="https://www.deviantart.com/_puppy/dadeviation/init?deviationid=${DEVIATION_ID}&username=${USERNAME}&type=art&include_session=false&csrf_token=${CSRF_TOKEN}&expand=deviation.related&preload=true&current_id=${CURRENT_ID}&da_minor_version=20230710"

curl -L "$URL" \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.9,fi;q=0.8,sv;q=0.7,de;q=0.6,it;q=0.5,fr;q=0.4' \
  -H 'cache-control: no-cache' \
  -b '_pxvid=0ac7a7a5-ceb2-11ef-ab93-e86dff00d8c9; __stripe_mid=66cb02a7-64fa-40d9-9ee5-c56bfd8efe6aff0df7; pxcts=854ebcb4-26bc-11f0-a327-e701f2a526b4; _px=Ofx16CJ3pW27IxZk9FJQLv7BR115bItYE7MlzzH0oyEcePvECKcr80h8/VtBtdWjHAkGOmZFd4g0MV5o8uyPMw==:1000:q7e4Q0LBDerJdEHSUOFwf6X9JD1LI856BuLFwCA6tUAa+fGjWEpv/qph4dMni08llTkRgxd/Upe06A2k1YwC47uDZM/79tS6yWaqHKm+G5jyL4mPN9Z3xGJzekYqQ1/C8LKiGftyHPUYgkfUo6xXol5ncBNqyMDcKETaTcpyOrWWzI9iAlwFLXNBCGnShhEYoFRQCd1u8sEp0YeT0ijghomdWV18UplOtn3Sx7ytF1TQ4QvlgK7RhJ+6/6VTXE0k2DwPsC/6C/klvjw+UXLU0Q==; auth_secure=__bb5cc7b316f2aa1bc548%3B%2208ff2c44677ab45c111ad46c9a02059a%22; userinfo=__0c8fce85707afe86780d%3B%7B%22username%22%3A%22sheikkinen%22%2C%22uniqueid%22%3A%2235d3046c17958ec0985ea8f6dc9b4ec6%22%2C%22dvs9-1%22%3A1%2C%22pv%22%3A%22c%3D1%2C1%2C1%2C1%22%7D; auth=__0936e40d2679c324f331%3B%229ea99bba5bd93d26b743a13121dcb005%22; td=0:1327%3B2:2294%3B3:667%3B6:891x873%3B7:1440%3B10:667%3B11:536%3B12:1447x1147%3B13:2278%3B17:871%3B18:1136%3B21:632%3B22:600%3B25:603%3B26:585%3B27:1067%3B28:1067%3B31:1610%3B32:600%3B34:274%3B36:262%3B38:601%3B39:780%3B40:534%3B41:780%3B42:310%3B44:526%3B49:634%3B51:1920%3B52:569%3B54:1844x963%3B55:1920%3B56:750' \
  -H 'pragma: no-cache' \
  -H 'priority: u=1, i' \
  -H "referer: https://www.deviantart.com/${USERNAME}/art/How-They-Met-${CURRENT_ID}" \
  -H 'sec-ch-ua: "Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-ch-viewport-height: 1147' \
  -H 'sec-ch-viewport-width: 1447' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36' \
  -o "results-gruser/gruser_${DEVIATION_ID}.json"
