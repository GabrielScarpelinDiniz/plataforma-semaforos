# Plataforma para controle de semáforos

## Descrição
Este projeto tem como objetivo a criação de uma plataforma para controle de semáforos, onde é possível visualizar o estado atual de cada semáforo, bem como configurar o tempo de cada estado (verde, amarelo e vermelho) de cada semáforo. Além disso, a plataforma permite a adição de sensores (LDR) para detectar a presença de veículos e botões para acionamento dos pedestres caso desejem atravessar a rua.

## Tecnologias
- React
- Typescript
- Websockets
- Mqtt

## Aviso importante

A plataforma não conta com backend, logo, não é possível salvar as configurações e deixar os semáforos rodando sem o navegador aberto. A aplicação foi feita apenas com o intuito de simular da maneira mais breve possível o funcionamento de um semáforo. Até o presente momento, não há previsão para a implementação de um backend.

Além disso, os sensores LDR e os botões funcionam, porém com um tempo fixo de fechamento e abertura do semáforo. A ideia é que, futuramente, seja possível configurar o tempo de abertura e fechamento do semáforo através da plataforma. (Sinceramente, não fiz por preguiça mesmo, pois é algo bem simples de se fazer. A pressa também não ajudou a fazer).

## Como rodar o projeto
1. Clone o repositório
2. Instale as dependências
```bash
npm install
```
3. Crie o seguinte arquivo: `src/config/mqttConfig.ts` e adicione o seguinte conteúdo:
```typescript
const MQTT_CONFIG = {
  brokerUrl: '',
  options: {
    protocol: 'wss',
    username: '',
    password: '',
  }
};

export default MQTT_CONFIG;
```
4. Preencha as informações do broker MQTT no arquivo `mqttConfig.ts`
5. Rode o projeto
```bash
npm run dev
```
6. Acesse o projeto em `http://localhost:5173`

## Guia básico de uso

A sua missão é sem eu entregar o código fonte que vai nos microcontroladores ESP32, fazer com que a plataforma funcione. Para isso, siga os passos abaixo:

1. Você deve publicar uma mensagem no tópico `traffic-light/{id}/new`. Pode ausentar o payload, pois o mesmo não é utilizado.

2. Após publicar a mensagem, você deve se inscrever no tópico `traffic-light/state/{id}` para receber as informações do semáforo. (Eu sei que se for seguir o padrão do restante do código, o tópico deveria ser `traffic-light/{id}/state`, mas eu fiz assim e não vou mudar agora).

3. Use e abuse da plataforma, arraste os semáforos para a área de trabalho, lembrando que precisa ter dois semáforos no mesmo círculo azul (você vai entender visualmente), para que você possa configurar o tempo de cada estado (verde, amarelo e vermelho) de cada semáforo. O círculo azul define um cruzamento, ou seja, os semáforos dentro do círculo azul são considerados como semáforos de um mesmo cruzamento. Se você colocar fora, eles serão considerados como semáforos de cruzamentos diferentes, mas fique tranquilo que se foi por engano, você pode remover ele e arrastar novamente.

4. Publique as atualizações do sensor LDR e do botão no tópico `traffic-light/{id}/ldr-state` e `traffic-light/{id}/walker-button`, respectivamente. O payload deve ser um objeto JSON com a seguinte estrutura:
```json
{
  "ldrState": "HIGH" | "LOW",
}
```

Se for o botão:

```json
{
  "buttonState": "HIGH" | "LOW",
}
```

5. Pronto! Agora é só ver a mágica acontecer.

## Observações

- Provavelmente vai ter bugs, então, se encontrar algum, abra uma issue. (Ou não, porque eu não vou corrigir mesmo (talvez..........)).
- Se você quiser contribuir, fique à vontade.
- Se você quiser fazer um fork e fazer o que quiser, fique à vontade também.

## Licença

Não tem. Pode fazer o que quiser com o código. Se quiser me dar os créditos, eu agradeço. Se não quiser, eu também agradeço. (Mas se quiser mesmo, eu agradeço mais ainda).

## Linkedin

Se ainda não me tiver no Linkedin: [Clique aqui](https://www.linkedin.com/in/gabriel-scarpelin-diniz-425258144/)

# Obrigado! 🚀

```
Gostou do README? Se sim, dá uma estrela no repositório. Se não, dá uma estrela também. Se quiser, pode dar uma estrela em todos os meus repositórios. Eu agradeço. (Mas se não quiser, eu agradeço também).
```