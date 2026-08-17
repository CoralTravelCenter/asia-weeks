# B2C landing

```bash
b2c-landing-vite check
b2c-landing-vite dev
b2c-landing-vite build
```

Каждый файл `src/scripts/<block>.js` экспортирует функцию инициализации по
умолчанию. Builder вызывает её после добавления разметки блока:

```js
export default function init() {
  const block = document.querySelector(".welcome");
  if (!block) return;
}
```
