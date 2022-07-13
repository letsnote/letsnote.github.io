export interface GroupListModel {
    groups: GroupModel[];
  }
  
export interface GroupModel extends _Types.GroupsResponse.RootObject {
    itemCount?: number;
    disabled?: boolean
  };