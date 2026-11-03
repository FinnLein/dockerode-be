type JsonPrimitive = string | number | boolean;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type { JsonArray, JsonObject, JsonPrimitive, JsonValue };

