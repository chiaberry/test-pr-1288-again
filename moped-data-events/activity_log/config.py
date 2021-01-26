import os

COGNITO_DYNAMO_TABLE_NAME = os.getenv("COGNITO_DYNAMO_TABLE_NAME", "")
HASURA_ADMIN_SECRET = os.getenv("HASURA_ADMIN_SECRET", "")
HASURA_ENDPOINT = os.getenv("HASURA_ENDPOINT", "")

# Prep Hasura query
HASURA_HTTP_HEADERS = {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET,
}

HASURA_EVENT_VALIDATION_SCHEMA = {
    "event": {
        "type": "dict",
        "schema": {
            "session_variables": {
                "type": "dict",
                "schema": {
                    "x-hasura-role": {
                        "type": "string",
                        "required": True,
                        "allowed": [
                            "admin",
                            "moped-admin",
                            "moped-editor",
                            "moped-viewer",
                        ]
                    },
                    "x-hasura-user-id": {
                        "type": "string",
                        "required": False,
                    },
                    "x-hasura-user-db-id": {
                        "type": "number",
                        "required": False,
                    }
                }
            },
            "op": {
                "type": "string",
                "required": True,
                "allowed": [
                    "INSERT",
                    "UPDATE",
                    "DELETE",
                ]
            },
            "data": {
                "type": "dict",
                "schema": {
                    "old": {
                        "type": "dict",
                        "required": True,
                        "nullable": True,
                    },
                    "new": {
                        "type": "dict",
                        "required": True,
                        "nullable": True,
                    }
                }
            },
            "trace_context": {
                "type": "dict",
                "schema": {
                    "trace_id": {
                        "type": "integer",
                        "required": True,
                    },
                    "span_id": {
                        "type": "integer",
                        "required": True,
                    }
                },
            }
        },
    },
    "created_at": {
        "type": "string",
        "required": True,
    },
    "id": {
        "type": "string",
        "required": True,
    },
    "delivery_info": {
        "type": "dict",
        "schema": {
            "max_retries": {
                "type": "integer",
                "required": True,
            },
            "current_retry": {
                "type": "integer",
                "required": True,
            },
        }
    },
    "trigger": {
        "type": "dict",
        "schema": {
            "name": {
                "type": "string",
                "required": True,
                "nullable": False,
                "minlength": 12,
            }
        }
    },
    "table": {
        "type": "dict",
        "schema": {
            "schema": {
                "type": "string",
                "required": True,
                "allowed": ["public"]
            },
            "name": {
                "type": "string",
                "required": True,
                "allowed": [
                    "moped_project"
                ]
            }
        },
    },
}