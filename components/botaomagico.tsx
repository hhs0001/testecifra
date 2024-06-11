"use client"

import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Função para converter uma string para um buffer Array
function strToArrayBuffer(str: string | undefined) {
    return new TextEncoder().encode(str);
}

// Função para converter um buffer Array para string
function arrayBufferToStr(buffer: AllowSharedBufferSource | undefined) {
    return new TextDecoder().decode(buffer);
}

// Função para gerar uma chave de criptografia AES
async function generateKey(token: string | undefined) {
    const keyMaterial = strToArrayBuffer(token);
    return await crypto.subtle.importKey(
        "raw",
        keyMaterial,
        "PBKDF2",
        false,
        ["deriveKey"]
    );
}

// Função para derivar a chave AES a partir de uma chave básica
async function deriveAESKey(baseKey: CryptoKey) {
    return await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: strToArrayBuffer("s0m3R@nd0mS@lt"), //mudar isso aq
            iterations: 1000,
            hash: "SHA-256"
        },
        baseKey,
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// Função para criptografar dados
async function encryptData(data: string | undefined, token: string | undefined) {
    const baseKey = await generateKey(token);
    const aesKey = await deriveAESKey(baseKey);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // IV de 12 bytes para AES-GCM
    const encodedData = strToArrayBuffer(data);
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        encodedData
    );
    // Concatena IV e dados criptografados para armazenar
    const encryptedArray = new Uint8Array(iv.byteLength + encrypted.byteLength);
    encryptedArray.set(iv);
    encryptedArray.set(new Uint8Array(encrypted), iv.byteLength);
    return btoa(String.fromCharCode(...encryptedArray)); // Converte para Base64
}

// Função para descriptografar dados
async function decryptData(data: string, token: string | undefined) {
    const baseKey = await generateKey(token);
    const aesKey = await deriveAESKey(baseKey);
    const encryptedArray = new Uint8Array(atob(data).split('').map(char => char.charCodeAt(0)));
    const iv = encryptedArray.slice(0, 12); // Primeiros 12 bytes são o IV
    const encryptedData = encryptedArray.slice(12);
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        encryptedData
    );
    return arrayBufferToStr(decrypted);
}

export default function Botaomagico() {
    const token = process.env.NEXT_PUBLIC_CYPHER_KEY as string; // Use uma chave secreta

    const arrayPalavras = ['teste', 'teste2', 'teste3', 'teste4', 'teste5'];
    const array = [1, 2, 3, 4, 5];

    async function setarVariavel() {
        const palavra = arrayPalavras[Math.floor(Math.random() * arrayPalavras.length)];
        const encrypted = await encryptData(palavra, token);
        Cookies.set('variavel', encrypted);
        toast.success('Variável setada com sucesso');
    }

    async function printVariavel() {
        const encrypted = Cookies.get('variavel');
        if (encrypted) {
            const decrypted = await decryptData(encrypted, token);
            toast.info(decrypted);
        } else {
            toast.error('Variável não encontrada');
        }
    }

    async function setarArray() {
        const encrypted = await encryptData(JSON.stringify(array), token);
        Cookies.set('array', encrypted);
        toast.success('Array setado com sucesso');
    }

    async function printArray() {
        const encrypted = Cookies.get('array');
        if (encrypted) {
            const decrypted = await decryptData(encrypted, token);
            toast.info(decrypted);
        } else {
            toast.error('Array não encontrado');
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex flex-row gap-4">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={setarVariavel}>
                    Setar variável
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={printVariavel}>
                    Print variável
                </button>
            </div>
            <div className="flex flex-row gap-4">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={setarArray}>
                    Setar array
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={printArray}>
                    Print array
                </button>
            </div>
        </div>
    )
}
