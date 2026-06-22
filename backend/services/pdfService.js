import PDFDocument from 'pdfkit';

export const generatePDF = (itinerary) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('Travel Itinerary', { align: 'center' })
         .moveDown();

      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text(itinerary.itineraryData.destination, { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Travel Dates: ${new Date(itinerary.startDate).toLocaleDateString()} - ${new Date(itinerary.endDate).toLocaleDateString()}`, { align: 'center' })
         .moveDown(2);

      // Preferences
      if (itinerary.preferences) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Travel Preferences', { underline: true })
           .moveDown(0.5);

        doc.fontSize(11)
           .font('Helvetica')
           .text(`Budget: ${itinerary.preferences.budget || 'Not specified'}`)
           .text(`Interests: ${itinerary.preferences.interests?.join(', ') || 'General'}`)
           .text(`Travel Pace: ${itinerary.preferences.travelPace || 'Moderate'}`)
           .moveDown(2);
      }

      // Daily Itinerary
      itinerary.itineraryData.days.forEach((day) => {
        doc.addPage()
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(`Day ${day.day}: ${day.title}`, { underline: true })
           .moveDown(1);

        day.activities.forEach((activity, index) => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`${activity.time} - ${activity.name}`)
             .moveDown(0.3);

          doc.fontSize(10)
             .font('Helvetica')
             .text(activity.description, { align: 'justify' })
             .moveDown(1);
        });
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

