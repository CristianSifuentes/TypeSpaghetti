# TypeScript Deep Knowledge Guide

## Table of Contents
1. [Basic Characteristics](#basic-characteristics)
2. [Medium Characteristics](#medium-characteristics)
3. [Advanced Characteristics](#advanced-characteristics)
4. [Expert Characteristics](#expert-characteristics)
5. [Conclusion](#conclusion)

## Basic Characteristics

1. **Static Typing**: Unlike JavaScript, TypeScript enforces type safety, preventing runtime type-related errors.
2. **Type Annotations**: Developers can explicitly define variable and function return types.
3. **Compilation to JavaScript**: TypeScript is transpiled to JavaScript using `tsc` (TypeScript Compiler).
4. **ES6+ Features Support**: Supports modern JavaScript syntax and compiles it down to ES5 if needed.
5. **Basic Type System**:
   - `number`, `string`, `boolean`, `null`, `undefined`, `any`, `void`
   - Arrays: `number[]`, `Array<string>`
   - Tuples: `[string, number]`
   - Enums: `enum Colors { Red, Green, Blue }`
6. **Function Typing**:
   ```typescript
   function add(a: number, b: number): number {
       return a + b;
   }
   ```
7. **Interfaces**: Contracts for object shapes.
   ```typescript
   interface User {
       id: number;
       name: string;
   }
   ```

## Medium Characteristics

1. **Union and Intersection Types**:
   ```typescript
   type ID = string | number;
   type Employee = { id: number } & { name: string };
   ```
2. **Optional and Readonly Properties**:
   ```typescript
   interface Config {
       readonly apiKey: string;
       timeout?: number;
   }
   ```
3. **Generics**:
   ```typescript
   function identity<T>(arg: T): T {
       return arg;
   }
   ```
4. **Type Inference**: TypeScript can infer types without explicit annotations.
5. **Enums with Custom Values**:
   ```typescript
   enum StatusCode {
       Success = 200,
       NotFound = 404,
   }
   ```
6. **Type Guards**:
   ```typescript
   function isNumber(value: any): value is number {
       return typeof value === 'number';
   }
   ```

## Advanced Characteristics

1. **Mapped Types**:
   ```typescript
   type Readonly<T> = { readonly [K in keyof T]: T[K] };
   ```
2. **Conditional Types**:
   ```typescript
   type IsString<T> = T extends string ? true : false;
   ```
3. **Discriminated Unions** (for better type narrowing):
   ```typescript
   interface Circle {
       kind: "circle";
       radius: number;
   }
   interface Square {
       kind: "square";
       side: number;
   }
   type Shape = Circle | Square;
   function getArea(shape: Shape) {
       if (shape.kind === "circle") {
           return Math.PI * shape.radius ** 2;
       }
   }
   ```
4. **Decorators (Experimental Feature in Angular and NestJS)**:
   ```typescript
   function Log(target: any, key: string) {
       console.log(`Calling method ${key}`);
   }
   class Example {
       @Log
       greet() {
           console.log("Hello");
       }
   }
   ```
5. **Utility Types** (`Partial`, `Required`, `Readonly`, `Pick`, `Omit`)
   ```typescript
   type PartialUser = Partial<{ id: number; name: string }>
   ```
6. **Namespace and Module Resolution** for Large-Scale Projects
7. **Generic Constraints**: Restrict a type parameter to a subset of types with `extends`.
   ```typescript
   function func<T extends string | number>(value: T): T {
       return value;
   }
   func("Hello"); // OK, T = string
   func(42);      // OK, T = number
   // func(true); // Error: boolean is not assignable to string | number
   ```
8. **Generic Interfaces**: Define reusable contracts parameterized over multiple types.
   ```typescript
   interface Repository<T, U> {
       items: T[];
       add(item: T): void;
       getById(id: U): T | undefined;
   }
   ```
9. **Generic Classes**: Bind every member of a class to a type parameter for structural consistency.
   ```typescript
   class UserDetails<T extends User> {
       id: T['id'];
       name: T['name'];
       constructor(user: T) {
           this.id = user.id;
           this.name = user.name;
       }
   }
   ```
10. **Constraining Parameters to Prior Arguments** with `keyof`:
    ```typescript
    function getProperty<T>(obj: T, key: keyof T) {
        return obj[key];
    }
    const x = { a: 1, b: 2 };
    getProperty(x, "a"); // OK
    // getProperty(x, "c"); // Error: "c" is not "a" | "b"
    ```

## Expert Characteristics

1. **Abstract Classes and Advanced Object-Oriented Features**
   ```typescript
   abstract class Animal {
       abstract makeSound(): void;
   }
   ```
2. **Deep Type Inference with Conditional Types**
   ```typescript
   type InferType<T> = T extends { type: infer U } ? U : never;
   ```
3. **Deeply Nested Type Checking and Recursive Types**
   ```typescript
   type JSONValue = string | number | boolean | { [x: string]: JSONValue };
   ```
4. **Module Federation in Large Applications (Micro Frontends with Angular/Nx)**
5. **TypeScript Compiler Internals (TSConfig, Custom Transformers)**
   - `strict`: Enables strict type checking
   - `moduleResolution`: Determines how modules are resolved
6. **Performance Optimizations with `tsc` and Babel**
7. **Type-Driven Development (TDD with TypeScript in Enterprise)**
8. **Applying TypeScript in Full-Stack Development (Angular, NestJS, Deno)**
9. **Type Variance**: How subtypes and supertypes relate when passed as arguments.
   - **Covariance** — a subtype is accepted where a supertype is expected:
     ```typescript
     class Vehicle { start() {} }
     class Car extends Vehicle { honk() {} }
     function run(v: Vehicle) { v.start(); }
     run(new Car()); // OK, Car is-a Vehicle
     ```
   - **Contravariance** — a supertype is used where a subtype's members must not be assumed:
     ```typescript
     function processVehicle(v: Vehicle) {
         v.start();
         // v.honk(); // Error: honk doesn't exist on Vehicle
     }
     ```
10. **Runtime Reflection**: TypeScript's checks are compile-time, but `typeof` and `instanceof` inspect types at runtime.
    ```typescript
    console.log(typeof 23);          // "number"
    console.log(new Vehicle() instanceof Vehicle); // true
    ```
11. **Dependency Injection**: Decouple a class from the concrete services it depends on by injecting interfaces through the constructor instead of instantiating them directly, making code easier to test and maintain.
    ```typescript
    interface IMentalWellnessService {
        getMentalWellnessAdvice(): string;
    }
    class MentalWellness implements IMentalWellnessService {
        getMentalWellnessAdvice(): string {
            return "Take time to meditate.";
        }
    }
    class HealthAdvice {
        constructor(private mentalWellnessService: IMentalWellnessService) {}
        getHealthAdvice(): string {
            return this.mentalWellnessService.getMentalWellnessAdvice();
        }
    }
    // Injecting the dependency instead of `new`-ing it inside HealthAdvice
    const healthAdvice = new HealthAdvice(new MentalWellness());
    ```

## Conclusion
TypeScript provides a strong foundation for scalable JavaScript applications. By mastering the expert-level features, developers can enhance maintainability, performance, and architecture for enterprise-level software solutions.