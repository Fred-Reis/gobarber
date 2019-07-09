import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    // aqui eu seleciono por padrão os campos criated at e update at
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
