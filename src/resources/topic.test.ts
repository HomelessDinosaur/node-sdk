// Copyright 2021, Nitric Technologies Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ResourceServiceClient } from '@nitric/api/proto/resource/v1/resource_grpc_pb';
import { UnimplementedError } from '../api/errors';
import { topic, SubscriptionWorkerOptions } from '.';
import { ResourceDeclareResponse } from '@nitric/api/proto/resource/v1/resource_pb';
import { Topic } from '..';
import * as faas from "../faas/index";

jest.mock('../faas/index');

describe('Registering topic resources', () => {
  describe('Given declare returns an error from the resource server', () => {
    const MOCK_ERROR = {
      code: 2,
      message: 'UNIMPLEMENTED',
    };

    const validName = 'my-topic';
    let declareSpy;

    beforeAll(() => {
      declareSpy = jest
        .spyOn(ResourceServiceClient.prototype, 'declare')
        .mockImplementationOnce((request, callback: any) => {
          callback(MOCK_ERROR, null);

          return null as any;
        });
    });

    afterAll(() => {
      declareSpy.mockClear();
    });

    it('Should throw the error', async () => {
      await expect(topic(validName)['registerPromise']).rejects.toEqual(
        new UnimplementedError('UNIMPLEMENTED')
      );
    });

    it('Should call the resource server', () => {
      expect(declareSpy).toBeCalledTimes(1);
    });
  });

  describe('Given declare succeeds on the resource server', () => {
    describe('When the service succeeds', () => {
      const validName = 'my-topic2';
      let otherSpy;

      beforeAll(() => {
        otherSpy = jest
          .spyOn(ResourceServiceClient.prototype, 'declare')
          .mockImplementationOnce((request, callback: any) => {
            const response = new ResourceDeclareResponse();
            callback(null, response);
            return null as any;
          });
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('Should succeed', async () => {
        await expect(
          topic(validName)['registerPromise']
        ).resolves.not.toBeNull();
      });

      it('Should call the resource server', () => {
        expect(otherSpy).toBeCalledTimes(1);
      });
    });
  });

  describe('Given a topic is already registered', () => {
    const topicName = 'already-exists';
    let topicResource;
    let existsSpy;

    beforeEach(() => {
      // ensure a success is returned and calls can be counted.
      existsSpy = jest
        .spyOn(ResourceServiceClient.prototype, 'declare')
        .mockImplementation((request, callback: any) => {
          const response = new ResourceDeclareResponse();
          callback(null, response);
          return null as any;
        });

      // register the resource for the first time
      topicResource = topic(topicName);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('When registering a topic with the same name', () => {
      let secondTopic;

      beforeEach(() => {
        // make sure the initial registration isn't counted for these tests.
        existsSpy.mockClear();
        secondTopic = topic(topicName);
      });

      it('Should not call the server again', () => {
        expect(existsSpy).not.toBeCalled();
      });

      it('Should return the same resource object', () => {
        expect(topicResource === secondTopic).toEqual(true);
      });
    });

    describe('When declaring usage', () => {
      it('Should return a topic reference', () => {
        const ref = topicResource.for('publishing');
        expect(ref).toBeInstanceOf(Topic);
      });
    });
  });

  
});

describe("subscription", () => {
  const startSpy = jest.spyOn(faas.Faas.prototype, 'start').mockReturnValue(Promise.resolve());
  const mockFn = jest.fn();
    
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('When registering a subscription', () => {
    afterAll(() => {
      jest.resetAllMocks();
    });

    beforeAll(async () => {
      await topic("test-subscribe").subscribe(mockFn);
    });

    it("should create a new FaasClient", () => {
      expect(faas.Faas).toBeCalledTimes(1);
    });

    it("should provide Faas with ApiWorkerOptions", () => {
      const expectedOpts = new SubscriptionWorkerOptions("test-subscribe");
      expect(faas.Faas).toBeCalledWith(expectedOpts)
    });

    it("should call FaasClient::start()", () => {
      expect(startSpy).toBeCalledTimes(1);
    });
  });
})
