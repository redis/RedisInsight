import {
  AddMembersToZSetDto,
  DeleteMembersFromZSetDto,
  GetZSetMembersDto,
  SearchZSetMembersDto,
  SearchZSetMembersResponse,
  UpdateMemberInZSetDto,
  ZSetMemberDto,
} from 'src/modules/browser/z-set/dto';
import { SortOrder } from 'src/constants';

export const mockZSetMemberDto: ZSetMemberDto = {
  name: Buffer.from('member1'),
  score: '-inf',
};
export const mockZSetMemberDto2: ZSetMemberDto = {
  name: Buffer.from('member2'),
  score: 0,
};
export const mockZSetMemberDto3: ZSetMemberDto = {
  name: Buffer.from('member3'),
  score: 2,
};

export const mockZSetMemberDto4: ZSetMemberDto = {
  name: Buffer.from('member4'),
  score: 'inf',
};
export const mockGetMembersDto: GetZSetMembersDto = {
  keyName: Buffer.from('zSet'),
  offset: 0,
  count: 15,
  sortOrder: SortOrder.Asc,
};
export const mockSearchMembersDto: SearchZSetMembersDto = {
  keyName: Buffer.from('zSet'),
  cursor: 0,
  count: 15,
  match: '*',
};
export const mockAddMembersDto: AddMembersToZSetDto = {
  keyName: mockGetMembersDto.keyName,
  members: [
    mockZSetMemberDto,
    mockZSetMemberDto2,
    mockZSetMemberDto3,
    mockZSetMemberDto4,
  ],
};
export const mockUpdateMemberDto: UpdateMemberInZSetDto = {
  keyName: mockGetMembersDto.keyName,
  member: mockAddMembersDto.members[0],
};
export const mockMembersForZAddCommand = [
  mockZSetMemberDto.score,
  mockZSetMemberDto.name,
  mockZSetMemberDto2.score,
  mockZSetMemberDto2.name,
  mockZSetMemberDto3.score,
  mockZSetMemberDto3.name,
  mockZSetMemberDto4.score,
  mockZSetMemberDto4.name,
];
export const mockDeleteMembersDto: DeleteMembersFromZSetDto = {
  keyName: mockAddMembersDto.keyName,
  members: [
    mockZSetMemberDto.name,
    mockZSetMemberDto2.name,
    mockZSetMemberDto3.name,
    mockZSetMemberDto4.name,
  ],
};
export const getZSetMembersInAscResponse = {
  keyName: mockGetMembersDto.keyName,
  total: mockAddMembersDto.members.length,
  members: [...mockAddMembersDto.members],
};
export const getZSetMembersInDescResponse = {
  keyName: mockGetMembersDto.keyName,
  total: mockAddMembersDto.members.length,
  members: mockAddMembersDto.members.slice().reverse(),
};
export const mockSearchZSetMembersResponse: SearchZSetMembersResponse = {
  keyName: mockGetMembersDto.keyName,
  total: mockAddMembersDto.members.length,
  nextCursor: 0,
  members: [...mockAddMembersDto.members],
};
