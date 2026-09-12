# Maiêutica Mobile

Aplicativo Expo/React Native da aula conversacional de Biologia. Não possui
login: ao abrir, entra diretamente na aula de **Genética e Evolução**.

## Fluxo

1. O backend gera a saudação e o Kokoro cria a voz da professora Dora.
2. Ao terminar a fala, o microfone abre automaticamente.
3. O aluno fala e toca no botão verde para concluir.
4. Whisper transcreve, o RAG recupera o material e o Qwen conduz a conversa
   pela maiêutica.
5. A resposta toca automaticamente e o ciclo recomeça.

## Executar no WSL

```bash
cp .env.example .env
npm install
npx expo install --fix
npm run start
```

No `.env`, troque `192.168.0.10` pelo IP do computador na rede. Em celular
físico, `localhost` aponta para o próprio celular. Descubra o IP do Windows com:

```powershell
ipconfig
```

Com Android conectado por USB, a alternativa mais simples é:

```bash
adb reverse tcp:8080 tcp:8080
```

Nesse caso, use `EXPO_PUBLIC_API_URL=http://127.0.0.1:8080`. No emulador
Android, use `http://10.0.2.2:8080`. Em aparelho via Wi-Fi, use o IPv4 do
Windows e confirme que a porta encaminhada ao WSL está liberada no firewall.

Mantenha API Go, Ollama, Meilisearch, Whisper e Kokoro no ar. Teste antes:

```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/v1/voice/start
```

O Expo Go e o celular precisam estar na mesma rede do computador. Se o
firewall do Windows bloquear a porta 8080, libere-a para a rede privada.

## Limite desta V1

A experiência funciona em turnos: o microfone abre automaticamente, mas o
aluno toca para informar que terminou. A detecção automática de silêncio pode
ser adicionada depois sem alterar o contrato do RAG.
