import { TileDocument } from "@ceramicnetwork/stream-tile"

// Load (or create) a determinitic document for a given controller
export async function loadDocumentByController(ceramic, controller, tag) {
    return await TileDocument.deterministic(ceramic, {
        // A single controller must be provided to reference a deterministic document
        controllers: [controller],
        // A family or tag must be provided in addition to the controller
        family: "DefiKicksAdapter",
        tags: [tag],
    })
}

export async function createSchemaDocument(ceramic) {
    // The following call will fail if the Ceramic instance does not have an authenticated DID
    const doc = await TileDocument.create(ceramic, {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "MySchema",
        type: "object",
        properties: {
            name: {
                type: "string",
                maxLength: 150,
            },
            dataPoints: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            format: "date-time",
                        },
                        value: {
                            type: "number",
                        },
                    },
                    required: ["date", "value"],
                },
            },
        },
        required: ["name", "dataPoints"],
    })
    // The stream ID of the created document can then be accessed as the `id` property
    return doc.commitId
}
