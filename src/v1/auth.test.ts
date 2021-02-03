import { auth } from "../interfaces/v1";
import { AuthClient } from "./auth";

const { AuthClient: GrpcAuthClient, CreateUserResponse } = auth;
describe("AuthClient", () => {
  describe("createUser", () => {
    describe("Given nitric.v1.auth.CreateUser throws an error", () => {
      const MOCK_ERROR = {
        code: 2,
        message: "UNIMPLEMENTED"
      };
      let createUserMock: jest.SpyInstance;
      beforeAll(() => {
        createUserMock = jest.spyOn(GrpcAuthClient.prototype, 'createUser').mockImplementation((_, callback: any) => {
          callback(MOCK_ERROR, null);

          return null as any;
        });
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      test("Then AuthClient.createUser should reject", () => {
        const client = new AuthClient("test");
        expect(client.createUser("test", "test@test.com", "test")).rejects.toBe(MOCK_ERROR);
      });
    });

    describe("Given nitric.v1.auth.CreateUser succeeds", () => {
      let createUserMock: jest.SpyInstance;
      const MOCK_RESPONSE = new CreateUserResponse();
      beforeAll(() => {
        createUserMock = jest.spyOn(GrpcAuthClient.prototype, 'createUser').mockImplementation((_, callback: any) => {
          callback(null, MOCK_RESPONSE);

          return null as any;
        });
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      test("Then AuthClient.createUser should reject", () => {
        const client = new AuthClient("test");
        expect(client.createUser("test", "test@test.com", "test")).resolves.toEqual(undefined);
      });
    });
  });
});