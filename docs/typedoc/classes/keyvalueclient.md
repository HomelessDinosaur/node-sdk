[@nitric/sdk](../README.md) / KeyValueClient

# Class: KeyValueClient<T\>

KeyValueClient

Provides a simple KeyValue store interface

## Type parameters

Name | Type |
:------ | :------ |
`T` | *object* |

## Table of contents

### Constructors

- [constructor](keyvalueclient.md#constructor)

### Properties

- [collection](keyvalueclient.md#collection)
- [grpcClient](keyvalueclient.md#grpcclient)

### Methods

- [delete](keyvalueclient.md#delete)
- [get](keyvalueclient.md#get)
- [put](keyvalueclient.md#put)

## Constructors

### constructor

\+ **new KeyValueClient**<T\>(`collection`: *string*): [*KeyValueClient*](keyvalueclient.md)<T\>

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *object* |

#### Parameters:

Name | Type |
:------ | :------ |
`collection` | *string* |

**Returns:** [*KeyValueClient*](keyvalueclient.md)<T\>

Defined in: [src/api/kv/kv.ts:13](https://github.com/nitrictech/node-sdk/blob/1154827/src/api/kv/kv.ts#L13)

## Properties

### collection

• `Private` **collection**: *string*

Defined in: [src/api/kv/kv.ts:13](https://github.com/nitrictech/node-sdk/blob/1154827/src/api/kv/kv.ts#L13)

___

### grpcClient

• `Private` **grpcClient**: [*KeyValueClient*](grpc.kv.keyvalueclient.md)

Defined in: [src/api/kv/kv.ts:12](https://github.com/nitrictech/node-sdk/blob/1154827/src/api/kv/kv.ts#L12)

## Methods

### delete

▸ **delete**(`key`: *string*): *Promise*<void\>

Deletes a key from the store

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`key` | *string* | key the be deleted   |

**Returns:** *Promise*<void\>

A void promise

Example:
```typescript
import { KeyValueClient } from "@nitric/sdk";

const client = new KeyValueClient<any>("products"); 

await client.delete("nitric");
```

Defined in: [src/api/kv/kv.ts:121](https://github.com/nitrictech/node-sdk/blob/1154827/src/api/kv/kv.ts#L121)

___

### get

▸ **get**(`key`: *string*): *Promise*<T\>

Gets a key's value from the store

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`key` | *string* | key to retrieve the value from   |

**Returns:** *Promise*<T\>

Promise containg the key's value

Example:
```typescript
import { KeyValueClient } from "@nitric/sdk";

interface Product {
  id: string;
  name: string;
  description: string;
}

const client = new KeyValueClient<Product>("products");

const product = await client.get("nitric");
```

Defined in: [src/api/kv/kv.ts:89](https://github.com/nitrictech/node-sdk/blob/1154827/src/api/kv/kv.ts#L89)

___

### put

▸ **put**(`key`: *string*, `value`: T): *Promise*<void\>

Puts a new keyvalue to the store

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`key` | *string* | key to store the value under   |
`value` | T | the value to be stored   |

**Returns:** *Promise*<void\>

A void promise

Example:
```typescript
import { KeyValueClient } from "@nitric/sdk";

interface Product {
  id: string;
  name: string;
  description: string;
}

const client = new KeyValueClient<Product>("products");

await client.put("nitric", {
  id: "nitric",
  name: "nitric",
  description: "An development framework!",
});
```

Defined in: [src/api/kv/kv.ts:48](https://github.com/nitrictech/node-sdk/blob/1154827/src/api/kv/kv.ts#L48)