import {
  AddMembersToSetDto,
  DeleteMembersFromSetDto,
  GetSetMembersDto,
  GetSetMembersResponse,
} from 'src/modules/browser/set/dto';

export const mockSetMember = Buffer.from('Lorem ipsum dolor sit amet.');
export const mockSetMembers = [mockSetMember];
export const mockAddMembersToSetDto: AddMembersToSetDto = {
  keyName: Buffer.from('testSet'),
  members: [mockSetMember],
};
export const mockDeleteMembersFromSetDto: DeleteMembersFromSetDto = {
  keyName: mockAddMembersToSetDto.keyName,
  members: mockAddMembersToSetDto.members,
};
export const mockGetSetMembersDto: GetSetMembersDto = {
  keyName: mockAddMembersToSetDto.keyName,
  cursor: 0,
  count: 15,
  match: '*',
};
export const mockGetSetMembersResponse: GetSetMembersResponse = {
  keyName: mockGetSetMembersDto.keyName,
  nextCursor: 0,
  total: mockSetMembers.length,
  members: mockSetMembers,
};
