import { SERVICE_BIND } from "@/constants";
import { kv } from "@/interfaces";
import { Struct } from "google-protobuf/google/protobuf/struct_pb";
import * as grpc from "@grpc/grpc-js";

export class KeyValueClient<T extends { [key: string]: any }> {
  private grpcClient: kv.KeyValueClient;
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
    this.grpcClient = new kv.KeyValueClient(
      SERVICE_BIND,
      grpc.ChannelCredentials.createInsecure()
    );
  }

  async put(key: string, value: T): Promise<void> {
    const request = new kv.KeyValuePutRequest();
    request.setCollection(this.collection);
    request.setKey(key);
    request.setValue(Struct.fromJavaScript(value));

    try {
      return await new Promise<void>((resolve, reject) => {
        this.grpcClient.put(request, (error, _) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async get(key: string): Promise<T> {
    const request = new kv.KeyValueGetRequest();
    request.setCollection(this.collection);
    request.setKey(key);

    return new Promise<T>((resolve, reject) => {
      this.grpcClient.get(request, (error, response) => {
        if (error) {
          reject(error);
        } else {
          const document = response.getValue();

          resolve(document.toJavaScript() as T);
        }
      });
    });
  }

  async delete(key: string): Promise<void> {
    const request = new kv.KeyValueDeleteRequest();
    request.setCollection(this.collection);
    request.setKey(key);

    return new Promise<void>((resolve, reject) => {
      this.grpcClient.delete(request, (error, _) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}