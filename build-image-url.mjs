// build-image-url.mjs
import fs from 'fs/promises'; // For reading files asynchronously
import { jwtDecode } from 'jwt-decode'; // Note the import style for jwt-decode v4+

const BASE_DOMAIN = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com";

async function constructImageUrl(jsonFilePath, imageTypeIdentifier = "300W") {
    try {
        // 1. Read and parse the JSON file
        const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        // 2. Extract necessary fields from the main JSON
        const prettyNameSlug = jsonData.deviation.media.prettyName;
        const tokenString = jsonData.deviation.media.token[0];

        // 3. Decode the JWT to get the original image's server path
        const decodedToken = jwtDecode(tokenString);
        // Ensure the path exists; structure might vary slightly, adjust if needed
        if (!decodedToken.obj || !decodedToken.obj[0] || !decodedToken.obj[0][0] || !decodedToken.obj[0][0].path) {
            console.error("Could not find 'obj[0][0].path' in the decoded token.");
            return null;
        }
        const originalImageServerPath = decodedToken.obj[0][0].path;

        // 4. Find the transformation template for the desired image type
        const imageTypeInfo = jsonData.deviation.media.types.find(type => type.t === imageTypeIdentifier);

        if (!imageTypeInfo) {
            console.error(`Image type "${imageTypeIdentifier}" not found in JSON.`);
            return null;
        }
        const transformationTemplateC = imageTypeInfo.c;

        // 5. Substitute <prettyName> in the transformation template
        const substitutedTransformationPath = transformationTemplateC.replace(/<prettyName>/g, prettyNameSlug);

        // 6. Assemble the full URL
        const fullUrl = `${BASE_DOMAIN}${originalImageServerPath}${substitutedTransformationPath}?token=${tokenString}`;

        return fullUrl;

    } catch (error) {
        console.error("Error processing the request:", error);
        return null;
    }
}

// Example usage:
(async () => {
    // Get JSON file path from command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node build-image-url.mjs <json-file-path> [image-type]');
        console.error('Example: node build-image-url.mjs ./results-gruser/gruser_1000026712.json 300W');
        process.exit(1);
    }

    const filePath = args[0];
    const desiredType = args[1] || '300W'; // Default to '300W' if not specified

    const imageUrl = await constructImageUrl(filePath, desiredType);

    if (imageUrl) {
        console.log(imageUrl);
    } else {
        console.log(`ERROR: Could not construct image URL for file: ${filePath}`);
    }
})();