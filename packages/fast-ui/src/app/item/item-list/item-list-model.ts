import { ItemModel } from "../item/item.component";

export interface ItemListModel extends _Types.AnnotationsResponse.RootObject {
    rows: ItemModel[];
  }