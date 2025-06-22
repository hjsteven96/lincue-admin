import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            "no-unused-vars": "warn",
            "no-console": "warn",
            "react/no-unescaped-entities": "off",
            // 필요에 따라 여기에 다른 규칙을 추가하거나 재정의할 수 있습니다.
        },
    },
];

export default eslintConfig;
