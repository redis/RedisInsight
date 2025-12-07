import {
  DeleteListElementsDto,
  GetListElementResponse,
  GetListElementsDto,
  GetListElementsResponse,
  ListElementDestination,
  PushElementToListDto,
  SetListElementDto,
} from 'src/modules/browser/list/dto';
import { mockKeyDto } from 'src/modules/browser/__mocks__/keys';

export const mockIndex: number = 0;
export const mockListElement = Buffer.from('Lorem ipsum dolor sit amet.');
export const mockListElement2 = Buffer.from('Lorem ipsum dolor sit amet2.');
export const mockListElements = [mockListElement];
export const mockPushElementDto: PushElementToListDto = {
  keyName: mockKeyDto.keyName,
  elements: mockListElements,
  destination: ListElementDestination.Tail,
};
export const mockGetListElementsDto: GetListElementsDto = {
  keyName: mockKeyDto.keyName,
  offset: 0,
  count: 10,
};
export const mockSetListElementDto: SetListElementDto = {
  keyName: mockKeyDto.keyName,
  element: mockListElement,
  index: 0,
};
export const mockDeleteElementsDto: DeleteListElementsDto = {
  keyName: mockKeyDto.keyName,
  destination: ListElementDestination.Tail,
  count: 1,
};
export const mockGetListElementsResponse: GetListElementsResponse = {
  keyName: mockPushElementDto.keyName,
  total: mockListElements.length,
  elements: mockListElements,
};
export const mockGetListElementResponse: GetListElementResponse = {
  keyName: mockKeyDto.keyName,
  value: mockListElement,
};
