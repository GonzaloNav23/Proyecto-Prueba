def sumar(a, b):
    return a + b

def restar(a, b):
    return a - b

def multiplicar(a, b):
    return a * b

def dividir(a, b):
    if b == 0:
        return "Error: No se puede dividir por cero"
    return a / b

def main():
    print("=== Calculadora Sencilla ===")
    print("1. Sumar")
    print("2. Restar")
    print("3. Multiplicar")
    print("4. Dividir")

    opcion = input("\nElige una operación (1-4): ")

    if opcion in ("1", "2", "3", "4"):
        num1 = float(input("Primer número: "))
        num2 = float(input("Segundo número: "))

        if opcion == "1":
            resultado = sumar(num1, num2)
        elif opcion == "2":
            resultado = restar(num1, num2)
        elif opcion == "3":
            resultado = multiplicar(num1, num2)
        elif opcion == "4":
            resultado = dividir(num1, num2)

        print(f"\nResultado: {resultado}")
    else:
        print("Opción no válida")

if __name__ == "__main__":
    main()
