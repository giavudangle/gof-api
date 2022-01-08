
// Tạo favoite item bằng việc clone trước đó
// Giảm chi phí khởi tạo đối tượng

import Favorite from "../../../models/Favorite";

interface IPrototype {
    shallowClone(): IPrototype;
    deepClone(): IPrototype

}

export class FavoritePrototype implements IPrototype {
    private userId: string;
    private items: any;
    private prototype: IPrototype;
    constructor(userId: string, items: any) {
        this.userId = userId;``
        this.items = items;
        // Object Document Mapping
        this.prototype = new Favorite({
            userId: this.userId,
            items: this.items
        })

    }
    // Shallow Copy stores the references of objects to the original memory address.
    shallowClone(): IPrototype {
        let cloneable = Object.create(this.prototype || null);
        Object.keys(this).map((key: string) => {
            cloneable[key] = this[key];
        })
        return cloneable;
    }

    // Deep copy stores copies of the object’s value.
    deepClone(): IPrototype {
        return JSON.parse(JSON.stringify(this))
    }



}