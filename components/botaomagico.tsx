"use client"

import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

export default function Botaomagico() {

    const token = process.env.NEXT_PUBLIC_CYPHER_KEY as string; // Use uma chave secreta

    const arrayPalavras = ['teste', 'teste2', 'teste3', 'teste4', 'teste5'];

    const array = [1, 2, 3, 4, 5];

    // Função para criptografar dados
    function encryptData(data: string) {
        return CryptoJS.AES.encrypt(data, token).toString();
    }

    // Função para descriptografar dados
    function decryptData(data: string) {
        const bytes = CryptoJS.AES.decrypt(data, token);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    function setarVariavel() {
        const palavra = arrayPalavras[Math.floor(Math.random() * arrayPalavras.length)];
        const encrypted = encryptData(palavra);
        Cookies.set('variavel', encrypted);
        toast.success('Variável setada com sucesso');
    }

    function printVariavel() {
        const encrypted = Cookies.get('variavel');
        if (encrypted) {
            const decrypted = decryptData(encrypted);
            toast.info(decrypted);
        } else {
            toast.error('Variável não encontrada');
        }
    }

    function setarArray() {
        const encrypted = encryptData(JSON.stringify(array));
        Cookies.set('array', encrypted);
        toast.success('Array setado com sucesso');
    }

    function printArray() {
        const encrypted = Cookies.get('array');
        if (encrypted) {
            const decrypted = decryptData(encrypted);
            toast.info(decrypted);
        } else {
            toast.error('Array não encontrado');
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex flex-row gap-4 justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={setarVariavel}>
                    Setar variável
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={printVariavel}>
                    Print variável
                </button>
            </div>
            <div className="flex flex-row gap-4 justify-between">
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
