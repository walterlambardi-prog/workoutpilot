# Componentes Tamagui - WorkoutPilot

Esta guía muestra cómo usar los componentes Tamagui personalizados en WorkoutPilot.

## 🎨 Componentes Disponibles

### TButton

Botón con variantes y soporte para modo dark/light.

```tsx
import TButton from '@/components/TButton';

// Botón primario (default)
<TButton onPress={handlePress}>
  Comenzar Entrenamiento
</TButton>

// Botón secundario
<TButton variant="secondary" onPress={handlePress}>
  Cancelar
</TButton>

// Botón outline
<TButton variant="outline" onPress={handlePress}>
  Ver Detalles
</TButton>

// Botón ghost (sin fondo)
<TButton variant="ghost" onPress={handlePress}>
  Saltar
</TButton>

// Botón ancho completo
<TButton fullWidth onPress={handlePress}>
  Continuar
</TButton>
```

**Props disponibles:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `fullWidth`: boolean
- Todas las props de ButtonProps de Tamagui

---

### TCard

Card contenedor con bordes, sombras y animaciones.

```tsx
import TCard from '@/components/TCard';

// Card básico
<TCard>
  <TText>Contenido de la card</TText>
</TCard>

// Card con elevación
<TCard padding="$4">
  <THeading level={3}>Título</THeading>
  <TText>Descripción del ejercicio</TText>
</TCard>

// Card interactivo
<TCard
  pressable
  onPress={handlePress}
  padding="$5"
>
  <TText>Toca para abrir</TText>
</TCard>
```

**Props disponibles:**

- `elevated`: boolean - Añade sombra/elevación
- Todas las props de CardProps de Tamagui

---

### TInput

Input de formulario con label, validación y estados.

```tsx
import TInput from '@/components/TInput';

// Input básico
<TInput
  placeholder="Ingresa tu email"
  value={email}
  onChangeText={setEmail}
/>

// Input con label
<TInput
  label="Nombre de usuario"
  placeholder="ej: johndoe"
  value={username}
  onChangeText={setUsername}
/>

// Input con error
<TInput
  label="Contraseña"
  error="La contraseña es requerida"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
/>

// Input con texto de ayuda
<TInput
  label="Email"
  helperText="Usaremos este email para enviarte recordatorios"
  value={email}
  onChangeText={setEmail}
/>
```

**Props disponibles:**

- `label`: string - Label del input
- `error`: string - Mensaje de error (cambia color del borde)
- `helperText`: string - Texto de ayuda debajo del input
- Todas las props de InputProps de Tamagui

---

### TText y THeading

Componentes de texto con variantes y estilos predefinidos.

```tsx
import { TText, THeading } from '@/components/TText';

// Texto body (default)
<TText>Este es un texto normal</TText>

// Texto caption (pequeño)
<TText variant="caption">Texto pequeño o secundario</TText>

// Texto label (para labels de formulario)
<TText variant="label">Label de campo</TText>

// Headings de diferentes niveles
<THeading level={1}>Título Principal</THeading>
<THeading level={2}>Sección</THeading>
<THeading level={3}>Subsección</THeading>
<THeading level={4}>Título pequeño</THeading>
```

**Props TText:**

- `variant`: 'body' | 'caption' | 'label'
- Todas las props de TextProps de Tamagui

**Props THeading:**

- `level`: 1 | 2 | 3 | 4
- Todas las props de TextProps de Tamagui

---

### TStack y TRow

Componentes de layout para organizar contenido vertical y horizontalmente.

```tsx
import { TStack, TRow } from '@/components/TStack';

// Stack vertical con spacing
<TStack space="$4" padding="$4">
  <TText>Item 1</TText>
  <TText>Item 2</TText>
  <TText>Item 3</TText>
</TStack>

// Row horizontal con items centrados
<TRow space="$2" alignItems="center">
  <Icon name="checkmark" />
  <TText>Completado</TText>
</TRow>

// Stack con padding personalizado
<TStack
  padding="$4"
  backgroundColor="$background"
  borderRadius="$3"
>
  <THeading level={2}>Título</THeading>
  <TText>Contenido</TText>
</TStack>
```

**Props disponibles:**

- TStack: Todas las props de YStackProps de Tamagui
- TRow: Todas las props de XStackProps de Tamagui

---

## 🎨 Design Tokens

Usa tokens de diseño en lugar de valores hardcodeados:

```tsx
// ✅ BUENO - Usando tokens
<TStack space="$4" padding="$4" backgroundColor="$background">
  <TText color="$color">Texto</TText>
</TStack>

// ❌ MALO - Hardcodeando valores
<View style={{ padding: 16, backgroundColor: '#fff' }}>
  <Text style={{ color: '#000' }}>Texto</Text>
</View>
```

### Spacing Tokens

- `$1` = 4px
- `$2` = 8px
- `$3` = 12px
- `$4` = 16px
- `$5` = 20px
- `$6` = 24px
- `$7` = 32px

### Color Tokens

- `$color` - Color de texto principal
- `$background` - Color de fondo
- `$borderColor` - Color de bordes
- `$primary` - Color primario de la app
- `$success` - Verde para éxito
- `$error` - Rojo para errores
- `$warning` - Amarillo para advertencias

---

## 📝 Ejemplo Completo: Formulario de Login

```tsx
import { TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import TInput from "@/components/TInput";
import TButton from "@/components/TButton";
import { useState } from "react";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleLogin = () => {
    // Validación básica
    const newErrors = { email: "", password: "" };

    if (!email) newErrors.email = "Email es requerido";
    if (!password) newErrors.password = "Contraseña es requerida";

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      // Proceder con login
    }
  };

  return (
    <TStack padding="$4" space="$4">
      <TStack space="$2">
        <THeading level={1}>Bienvenido</THeading>
        <TText variant="caption">Ingresa tus credenciales para continuar</TText>
      </TStack>

      <TStack space="$4">
        <TInput
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TInput
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <TButton fullWidth onPress={handleLogin}>
          Iniciar Sesión
        </TButton>

        <TButton variant="ghost" fullWidth onPress={() => {}}>
          ¿Olvidaste tu contraseña?
        </TButton>
      </TStack>
    </TStack>
  );
}
```

---

## 🔄 Migración de Componentes Existentes

Cuando migres componentes existentes a Tamagui:

1. **Lee primero** `ui-refactor-tracking.txt` para ver el estado actual
2. **Reemplaza** Views con TStack/TRow
3. **Reemplaza** Text con TText/THeading
4. **Reemplaza** StyleSheet con props de Tamagui
5. **Usa** design tokens en lugar de valores hardcodeados
6. **Actualiza** el tracking file con tu progreso

---

## 📚 Recursos

- [Documentación oficial de Tamagui](https://tamagui.dev)
- [Archivo de tracking del proyecto](../ui-refactor-tracking.txt)
- [Copilot Instructions](../.github/copilot-instructions.md) - Sección "UI Library: Tamagui"
