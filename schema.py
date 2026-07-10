import jsonschema

def validate(data, schema):
    try:
        jsonschema.validate(data, schema)
        return True
    except jsonschema.exceptions.ValidationError:
        return False

register = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['username', 'password'],
    'properties': {
        'username': {'type': 'string', 'minLength': 3, 'maxLength': 20},
        'password': {'type': 'string', 'minLength': 6, 'maxLength': 5000}
    }
}

login = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['username', 'password'],
    'properties': {
        'username': {'type': 'string', 'minLength': 1, 'maxLength': 20},
        'password': {'type': 'string', 'minLength': 1, 'maxLength': 5000},
        'remember': {'type': 'boolean'}
    }
}

update_display_name = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['display_name'],
    'properties': {
        'display_name': {'type': 'string', 'maxLength': 25}
    }
}

update_don = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['body_fill', 'face_fill'],
    'properties': {
        'body_fill': {'type': 'string', 'pattern': '^#[0-9a-fA-F]{6}$'},
        'face_fill': {'type': 'string', 'pattern': '^#[0-9a-fA-F]{6}$'}
    }
}

update_password = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['current_password', 'new_password'],
    'properties': {
        'current_password': {'type': 'string', 'minLength': 1, 'maxLength': 5000},
        'new_password': {'type': 'string', 'minLength': 6, 'maxLength': 5000}
    }
}

delete_account = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['password'],
    'properties': {
        'password': {'type': 'string', 'minLength': 1, 'maxLength': 5000}
    }
}

scores_save = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'additionalProperties': False,
    'required': ['scores'],
    'properties': {
        'scores': {
            'type': 'array',
            'maxItems': 10000,
            'items': {'$ref': '#/definitions/score'}
        },
        'is_import': {'type': 'boolean'}
    },
    'definitions': {
        'score': {
            'type': 'object',
            'additionalProperties': False,
            'required': ['hash', 'score'],
            'properties': {
                'hash': {'type': 'string', 'minLength': 1, 'maxLength': 512},
                'score': {'type': 'string', 'minLength': 1, 'maxLength': 2048}
            }
        }
    }
}
