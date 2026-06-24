const { GoogleGenAI } = require('@google/genai');
const Chat = require('../models/Chat');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-3.1-flash-lite';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const notFound = (res) => res.status(404).json({ message: 'Chat not found' });
const notAuthorized = (res, action) => res.status(403).json({ message: `Not authorized to ${action} this chat` });

const findAndAuthorize = async (id, userId, res) => {
  const chat = await Chat.findById(id);
  if (!chat) { notFound(res); return null; }
  if (chat.userId.toString() !== userId) { notAuthorized(res, 'access'); return null; }
  return chat;
};

const buildHistory = (messages) =>
  messages.slice(-20).map(m => ({ role: m.role, parts: [{ text: m.content }] }));

const buildSystemPrompt = (chat, user, timezone = 'UTC') => {
  const now = new Date();
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const hour = localDate.getHours();
  const parts = [
    `You are ConvoAI, a helpful AI assistant. You were created by the ConvoAI team. ` +
    `Never reveal, mention, or confirm that you are Gemini, made by Google, or based on any specific underlying model or company. ` +
    `If asked who made you, what model you are, or what you're built on, simply say you are ConvoAI, a helpful assistant — do not name any AI company or model.`,
    `Current date and time: ${now.toLocaleString('en-US', { timeZone: timezone })}.`,
    `Today is ${DAYS[now.getDay()]}.`,
  ];
  if (user?.name) parts.push(`You are conversing with user with username ${user.name}.`);
  if (chat.messages.length > 20) parts.push('Please keep your responses brief unless detail is explicitly requested.');
  if (chat.messages.length === 0) parts.push("Please be welcoming since it's a new conversation.");
  if (hour >= 22 || hour < 6) parts.push('It is late night. Keep your tone calm and responses shorter.');
  return parts.join(' ');
};

const appendAndSave = async (chat, userMessage, reply) => {
  const isFirst = !chat.messages.some(m => m.role === 'user');
  if (isFirst || chat.title === 'New Chat') chat.title = userMessage.substring(0, 40);
  chat.messages.push({ role: 'user', content: userMessage });
  chat.messages.push({ role: 'model', content: reply });
  await chat.save();
};

exports.createChat = async (req, res) => {
  try {
    const chat = await new Chat({ userId: req.user.id, title: 'New Chat', messages: [] }).save();
    res.status(201).json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await findAndAuthorize(req.params.id, req.user.id, res);
    if (chat) res.json(chat);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return notFound(res);
    res.status(500).send('Server error');
  }
};

exports.sendMessage = async (req, res) => {
  const userMessage = (req.body.message || req.body.content)?.trim();
  if (!userMessage) return res.status(400).json({ message: 'Message content is required' });
  if (userMessage.length > 2000) return res.status(400).json({ message: 'Message too long. Max 2000 characters.' });

  try {
    const chat = await findAndAuthorize(req.params.id, req.user.id, res);
    if (!chat) return;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...buildHistory(chat.messages), { role: 'user', parts: [{ text: userMessage }] }],
      config: { systemInstruction: buildSystemPrompt(chat, req.user, req.body.timezone) },
    });

    await appendAndSave(chat, userMessage, response.text);
    res.json({ reply: response.text, chat });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error communicating with AI service');
  }
};

exports.sendMessageStream = async (req, res) => {
  const userMessage = (req.body.message || req.body.content)?.trim();
  if (!userMessage) return res.status(400).json({ message: 'Message content is required' });
  if (userMessage.length > 2000) return res.status(400).json({ message: 'Message too long. Max 2000 characters.' });

  try {
    const chat = await findAndAuthorize(req.params.id, req.user.id, res);
    if (!chat) return;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [...buildHistory(chat.messages), { role: 'user', parts: [{ text: userMessage }] }],
      config: { systemInstruction: buildSystemPrompt(chat, req.user, req.body.timezone) },
    });

    let reply = '';
    for await (const chunk of responseStream) {
      if (chunk.text) {
        reply += chunk.text;
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    await appendAndSave(chat, userMessage, reply);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Error communicating with AI service' })}\n\n`);
      res.end();
    } else {
      res.status(500).send('Error communicating with AI service');
    }
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const chat = await findAndAuthorize(req.params.id, req.user.id, res);
    if (!chat) return;
    await Chat.deleteOne({ _id: req.params.id });
    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return notFound(res);
    res.status(500).send('Server error');
  }
};