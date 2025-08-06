/**
 * Add new keys parameters
 * @param keyName The name of the key
 * @param TTL The ttl of the key
 * @param value The value of the key
 * @param members The members of the key
 * @param scores The scores of the key member
 * @param field The field of the key
 */
export type AddNewKeyParameters = {
    keyName: string,
    value?: string,
    TTL?: string,
    members?: string,
    scores?: string,
    field?: string,
    fields?: [{
        field?: string,
        valuse?: string
    }]
}

/**
 * Hash key parameters
 * @param keyName The name of the key
 * @param fields The Array with fields
 * @param field The field of the field
 * @param value The value of the field

 */
export type HashKeyParameters = {
    keyName: string,
    fields: {
        field: string,
        value: string
    }[]
}

/**
 * Stream key parameters
 * @param keyName The name of the key
 * @param entries The Array with entries
 * @param id The id of entry
 * @param fields The Array with fields
 */
export type StreamKeyParameters = {
    keyName: string,
    entries: {
        id: string,
        fields: {
            name: string,
            value: string
        }[]
    }[]
}

/**
 * Set key parameters
 * @param keyName The name of the key
 * @param members The Array with members
 */
export type SetKeyParameters = {
    keyName: string,
    members: string[]
}

/**
 * Sorted Set key parameters
 * @param keyName The name of the key
 * @param members The Array with members
 * @param name The name of the member
 * @param id The id of the member
 */
export type SortedSetKeyParameters = {
    keyName: string,
    members: {
        name: string,
        score: number
    }[]
}

/**
 * List key parameters
 * @param keyName The name of the key
 * @param element The element in list
 */
export type ListKeyParameters = {
    keyName: string,
    element: string
}

/**
 * String key parameters
 * @param keyName The name of the key
 * @param value The value in the string
 */
export type StringKeyParameters = {
    keyName: string,
    value: string
}

/**
 * The key arguments for multiple keys/fields adding
 * @param keysCount The number of keys to add
 * @param fieldsCount The number of fields in key to add
 * @param elementsCount The number of elements in key to add
 * @param membersCount The number of members in key to add
 * @param keyName The full key name
 * @param keyNameStartWith The name of key should start with
 * @param fieldStartWitht The name of field should start with
 * @param fieldValueStartWith The name of field value should start with
 * @param elementStartWith The name of element should start with
 * @param memberStartWith The name of member should start with
 */

export type AddKeyArguments = {
    keysCount?: number,
    fieldsCount?: number,
    elementsCount?: number,
    membersCount?: number,
    keyName?: string,
    keyNameStartWith?: string,
    fieldStartWith?: string,
    fieldValueStartWith?: string,
    elementStartWith?: string,
    memberStartWith?: string
}

/**
 * Keys Data parameters
 * @param textType The type of the key
 * @param keyName The name of the key
 */
export type KeyData = {
    textType: string,
    keyName: string
}[]
