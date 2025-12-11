# 📦 WMS - Base de Dados em Memória

Este módulo implementa uma **base de dados simples em memória** usando TypeScript e programação orientada a objetos (OOP). É ideal para aprendizagem, protótipos, ou testes rápidos.

> ⚠️ **Nota:** Os dados são perdidos quando a aplicação reinicia, pois ficam apenas em memória.

---

## 🏗️ Arquitetura

A estrutura segue o padrão de **Entidades** e **Tabelas**:

```
wms/
└── database/
    ├── index.tsx         # Ponto de entrada - exporta a instância da DB
    ├── entities/         # Classes que representam os "modelos" de dados
    │   └── user.ts       # Entidade User
    └── tables/           # Classes que gerem coleções de entidades (CRUD)
        └── users.ts      # Tabela de Users
```

### Conceitos Principais

| Conceito     | Descrição                                              |
| ------------ | ------------------------------------------------------ |
| **Entidade** | Representa um objeto individual (ex: um User)          |
| **Tabela**   | Gere uma coleção de entidades e fornece operações CRUD |
| **Database** | Agrupa todas as tabelas num único ponto de acesso      |

---

## 🚀 Como Usar

### 1. Importar a Base de Dados

```typescript
import database from "./database";
```

### 2. Listar Todos os Utilizadores

```typescript
const users = database.users.getUsers();
console.log(users);
```

### 3. Buscar Utilizador por UUID

```typescript
const user = database.users.getUserByUuid("abc-123-def");
```

### 4. Buscar Utilizador por Email

```typescript
const user = database.users.getUserByEmail("john@example.com");
```

### 5. Criar um Novo Utilizador

```typescript
import User from "./database/entities/user";

// Criar instância
const novoUser = new User();

// Definir os dados
novoUser.setUsername("Maria Silva");
novoUser.setEmail("maria@example.com");
novoUser.setPassword("senha123");

// Guardar na tabela
database.users.createUser(novoUser);
```

### 6. Atualizar um Utilizador

```typescript
const user = database.users.getUserByEmail("maria@example.com");

if (user) {
  user.setUsername("Maria Santos");
  user.setUpdatedAt(new Date());
  database.users.updateUser(user);
}
```

### 7. Eliminar um Utilizador

```typescript
database.users.deleteUser("uuid-do-utilizador");
```

---

## 🆕 Como Criar uma Nova Tabela (Passo a Passo)

Vamos criar uma tabela de **Produtos** como exemplo.

### Passo 1: Criar a Entidade

Cria o ficheiro `wms/database/entities/product.ts`:

```typescript
class Product {
  // Propriedades privadas (encapsulamento)
  private uuid: string;
  private name: string;
  private price: number;
  private stock: number;
  private createdAt: Date;
  private updatedAt: Date;

  // Constructor - inicializa valores por defeito
  constructor() {
    this.uuid = crypto.randomUUID(); // Gera ID único automático
    this.name = "";
    this.price = 0;
    this.stock = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // GETTERS - para ler os valores
  public getUuid() {
    return this.uuid;
  }

  public getName() {
    return this.name;
  }

  public getPrice() {
    return this.price;
  }

  public getStock() {
    return this.stock;
  }

  public getCreatedAt() {
    return this.createdAt;
  }

  public getUpdatedAt() {
    return this.updatedAt;
  }

  // SETTERS - para modificar os valores
  public setName(name: string) {
    this.name = name;
  }

  public setPrice(price: number) {
    this.price = price;
  }

  public setStock(stock: number) {
    this.stock = stock;
  }

  public setUpdatedAt(updatedAt: Date) {
    this.updatedAt = updatedAt;
  }
}

export default Product;
```

### Passo 2: Criar a Tabela

Cria o ficheiro `wms/database/tables/products.ts`:

```typescript
import Product from "../entities/product";

class ProductsTable {
  // Array que guarda todos os produtos
  private products: Product[] = [];

  constructor() {
    // Opcional: criar dados iniciais para testes
    const produto1 = new Product();
    produto1.setName("Teclado Mecânico");
    produto1.setPrice(79.99);
    produto1.setStock(50);
    this.createProduct(produto1);
  }

  // READ - Listar todos
  public getProducts() {
    return this.products;
  }

  // READ - Buscar por UUID
  public getProductByUuid(uuid: string) {
    return this.products.find((product) => product.getUuid() === uuid);
  }

  // READ - Buscar por nome
  public getProductByName(name: string) {
    return this.products.find((product) => product.getName() === name);
  }

  // CREATE - Adicionar novo
  public createProduct(product: Product) {
    this.products.push(product);
  }

  // UPDATE - Atualizar existente
  public updateProduct(product: Product) {
    const index = this.products.findIndex(
      (p) => p.getUuid() === product.getUuid()
    );
    if (index !== -1) {
      this.products[index] = product;
    }
  }

  // DELETE - Remover
  public deleteProduct(uuid: string) {
    const index = this.products.findIndex((p) => p.getUuid() === uuid);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }
}

export default ProductsTable;
```

### Passo 3: Registar na Base de Dados

Atualiza o ficheiro `wms/database/index.tsx`:

```typescript
import UsersTable from "./tables/users";
import ProductsTable from "./tables/products"; // 👈 Importar

class Database {
  users: UsersTable;
  products: ProductsTable; // 👈 Declarar

  constructor() {
    this.users = new UsersTable();
    this.products = new ProductsTable(); // 👈 Instanciar
  }
}

export default new Database();
```

### Passo 4: Usar a Nova Tabela

```typescript
import database from "./database";
import Product from "./database/entities/product";

// Criar produto
const laptop = new Product();
laptop.setName("MacBook Pro");
laptop.setPrice(2499.99);
laptop.setStock(10);
database.products.createProduct(laptop);

// Listar todos
const todosProdutos = database.products.getProducts();
console.log(todosProdutos);
```

---

## 📋 Checklist para Nova Tabela

- [ ] Criar ficheiro da entidade em `entities/`
- [ ] Definir propriedades privadas
- [ ] Criar constructor com valores iniciais
- [ ] Criar getters para cada propriedade
- [ ] Criar setters para propriedades editáveis
- [ ] Criar ficheiro da tabela em `tables/`
- [ ] Implementar array privado para guardar entidades
- [ ] Implementar métodos CRUD (Create, Read, Update, Delete)
- [ ] Registar tabela em `database/index.tsx`
- [ ] Exportar entidade se necessário

---

## 💡 Dicas para Iniciantes

1. **Propriedades Privadas**: Usa `private` para esconder dados internos. Só podem ser acedidos via getters/setters.

2. **UUID Automático**: `crypto.randomUUID()` gera IDs únicos automaticamente.

3. **Timestamps**: `createdAt` e `updatedAt` ajudam a rastrear quando os dados foram criados/modificados.

4. **Imutabilidade do UUID**: Nota que não há `setUuid()` - o UUID é gerado uma vez e nunca muda.

5. **Padrão CRUD**: Cada tabela deve ter pelo menos:
   - **C**reate (criar)
   - **R**ead (ler/buscar)
   - **U**pdate (atualizar)
   - **D**elete (eliminar)

---

## 🔮 Próximos Passos

Para uma base de dados real, considera usar:

- **Prisma** - ORM moderno para TypeScript
- **Drizzle** - ORM leve e type-safe
- **SQLite** - Base de dados leve em ficheiro
- **PostgreSQL** - Base de dados robusta para produção
