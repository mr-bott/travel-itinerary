import PDFDocument from 'pdfkit';

export const generatePDF = (itinerary) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4' }); // 0 margin for full bleed cover
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors matching the frontend theme
      const primaryColor = '#10b981'; // Emerald 500
      const darkColor = '#064e3b'; // Emerald 900
      const lightColor = '#d1fae5'; // Emerald 100
      const textColor = '#374151'; // Gray 700
      const bgAccent = '#f0fdf4'; // Emerald 50

      // ==========================================
      // --- STYLISH COVER PAGE ---
      // ==========================================
      
      // 1. Massive Abstract Geometric Header
      // Top Dark Green Block
      doc.rect(0, 0, doc.page.width, 350).fill(darkColor);
      
      // Decorative Light Green Triangle / Polygon intersecting
      doc.polygon([0, 350], [doc.page.width, 250], [doc.page.width, 350]).fill(primaryColor);
      
      // 2. Cover Titles (White text over dark background)
      doc.moveDown(5);
      doc.fontSize(16)
         .font('Helvetica-Oblique')
         .fillColor(lightColor)
         .text('YOUR CUSTOM AI-GENERATED', 0, 100, { align: 'center', characterSpacing: 2 });
         
      doc.fontSize(56)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text('Travel Itinerary', 0, 130, { align: 'center' });

      // Destination Name (Giant, Emerald)
      doc.fontSize(42)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text(itinerary.itineraryData.destination.toUpperCase(), 0, 220, { align: 'center' });

      // 3. Dates Badge
      doc.rect(doc.page.width / 2 - 125, 290, 250, 40).fill('#ffffff');
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(darkColor)
         .text(`${new Date(itinerary.startDate).toLocaleDateString()}  -  ${new Date(itinerary.endDate).toLocaleDateString()}`, 0, 303, { align: 'center' });

      // 4. "Boarding Pass" Style Trip Details Box
      if (itinerary.preferences) {
        const boxTop = 450;
        const boxMargin = 60;
        const boxWidth = doc.page.width - (boxMargin * 2);
        
        // Outer Shadow/Border
        doc.rect(boxMargin + 5, boxTop + 5, boxWidth, 180).fill('#e5e7eb');
        // Inner Box
        doc.rect(boxMargin, boxTop, boxWidth, 180).fill('#ffffff');
        doc.rect(boxMargin, boxTop, boxWidth, 180).stroke(primaryColor);
        
        // Box Header
        doc.rect(boxMargin, boxTop, boxWidth, 40).fill(bgAccent);
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(darkColor)
           .text('TRIP DETAILS', boxMargin, boxTop + 13, { align: 'center', characterSpacing: 1 });

        // Details Grid
        const col1 = boxMargin + 40;
        const col2 = boxMargin + (boxWidth / 2) + 20;
        
        // Label: Budget
        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('BUDGET PROFILE', col1, boxTop + 70);
        doc.fontSize(14).font('Helvetica').fillColor(textColor).text(itinerary.preferences.budget || 'Not specified', col1, boxTop + 85);
        
        // Label: Pace
        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('TRAVEL PACE', col2, boxTop + 70);
        doc.fontSize(14).font('Helvetica').fillColor(textColor).text(itinerary.preferences.travelPace || 'Moderate', col2, boxTop + 85);
        
        // Label: Interests
        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('KEY INTERESTS', col1, boxTop + 120);
        doc.fontSize(14).font('Helvetica').fillColor(textColor).text(itinerary.preferences.interests?.join(', ') || 'General', col1, boxTop + 135, { width: boxWidth - 80 });
      }

      // Footer
      doc.fontSize(10)
         .font('Helvetica-Oblique')
         .fillColor('#9ca3af')
         .text('Powered by AI Travel Planner', 0, doc.page.height - 50, { align: 'center' });

      // ==========================================
      // --- ITINERARY PAGES ---
      // ==========================================
      
      // Force itinerary to start on page 2
      doc.addPage({ margin: 50 });
      
      // Reset margins for standard pages
      doc.page.margins = { top: 50, bottom: 50, left: 50, right: 50 };

      // Top decorative bar for Page 2
      doc.rect(0, 0, doc.page.width, 15).fill(primaryColor);
      doc.moveDown(1);

      itinerary.itineraryData.days.forEach((day, index) => {
        // Pagination logic: If near bottom, break to new page
        if (doc.y > doc.page.height - 180) {
          doc.addPage({ margin: 50 });
          doc.rect(0, 0, doc.page.width, 15).fill(primaryColor);
          doc.moveDown(2);
        } else if (index > 0) {
          doc.moveDown(1.5);
        }
        
        // Day Header Block
        doc.rect(50, doc.y, doc.page.width - 100, 35).fill(darkColor);
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text(`Day ${day.day}: ${day.title}`, 65, doc.y + 10);
        
        doc.moveDown(1.5);

        day.activities.forEach((activity) => {
          // Safety buffer for pagination
          if (doc.y > doc.page.height - 80) {
            doc.addPage({ margin: 50 });
            doc.rect(0, 0, doc.page.width, 15).fill(primaryColor);
            doc.moveDown(2);
          }

          // Time bullet
          doc.circle(55, doc.y + 6, 4).fill(primaryColor);
          
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .fillColor(darkColor)
             .text(`${activity.time} - ${activity.name}`, 70, doc.y)
             .moveDown(0.3);

          // Meta details (price, rating, location) if available
          let metaText = [];
          if (activity.price) metaText.push(`Cost: ${activity.price}`);
          if (activity.rating) metaText.push(`Rating: ${activity.rating}`);
          if (activity.location) metaText.push(`Location: ${activity.location}`);
          
          if (metaText.length > 0) {
            doc.fontSize(9)
               .font('Helvetica-Oblique')
               .fillColor(primaryColor)
               .text(metaText.join(' | '), 70, doc.y)
               .moveDown(0.3);
          }

          doc.fontSize(11)
             .font('Helvetica')
             .fillColor(textColor)
             .text(activity.description, 70, doc.y, { align: 'justify', width: 450 })
             .moveDown(1);
        });
      });

      // ==========================================
      // --- HOTELS & BUDGET (If Available) ---
      // ==========================================
      if (itinerary.itineraryData.hotels || itinerary.itineraryData.budgetEstimation) {
        doc.addPage({ margin: 50 });
        doc.rect(0, 0, doc.page.width, 15).fill(primaryColor);
        doc.moveDown(2);

        if (itinerary.itineraryData.hotels && itinerary.itineraryData.hotels.length > 0) {
          doc.fontSize(20).font('Helvetica-Bold').fillColor(darkColor).text('Recommended Hotels', 50, doc.y).moveDown(1);
          
          itinerary.itineraryData.hotels.forEach(hotel => {
            doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text(hotel.name)
               .fontSize(12).font('Helvetica').fillColor(textColor).text(hotel.description)
               .moveDown(0.5)
               .fontSize(10).font('Helvetica-Oblique').text(`Price: ${hotel.price || 'N/A'} | Rating: ${hotel.rating || 'N/A'}`)
               .moveDown(1);
          });
          doc.moveDown(1);
        }

        if (itinerary.itineraryData.budgetEstimation) {
          const budget = itinerary.itineraryData.budgetEstimation;
          doc.fontSize(20).font('Helvetica-Bold').fillColor(darkColor).text('Budget Estimation', 50, doc.y).moveDown(1);
          
          doc.fontSize(12).font('Helvetica').fillColor(textColor);
          if (budget.flights) doc.text(`Flights: ${budget.flights}`);
          if (budget.accommodation) doc.text(`Accommodation: ${budget.accommodation}`);
          if (budget.food) doc.text(`Food: ${budget.food}`);
          if (budget.activities) doc.text(`Activities: ${budget.activities}`);
          
          doc.moveDown(0.5);
          doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text(`Total Estimated Cost: ${budget.total}`);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
