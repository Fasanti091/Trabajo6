import { faker } from '@faker-js/faker/locale/es';

export const generateProducts = ()=>
{
    const categories = ["Bebidas energéticas", "Bebidas sin azúcar", "Ediciones limitadas", "Bebidas no carbonatadas"];
    const status = [true,false];
    
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.helpers.arrayElement(categories),
        code: faker.number.int(),
        status: faker.helpers.arrayElement(status),
        stock: faker.number.int(),
        price: faker.commerce.price(),
        thumbnail: "https://m.media-amazon.com/images/I/713yzgYc7KL._AC_UF894,1000_QL80_.jpg",
        createdAt: faker.date.anytime(),
        updatedAt: faker.date.anytime()
    }
}