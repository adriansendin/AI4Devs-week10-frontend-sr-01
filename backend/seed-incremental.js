const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Adding missing interview steps and candidates...');

  // Get existing interview flows
  const interviewFlow1 = await prisma.interviewFlow.findFirst({
    where: { description: 'Standard development interview process' }
  });

  const interviewFlow2 = await prisma.interviewFlow.findFirst({
    where: { description: 'Data science interview process' }
  });

  // Get existing interview types
  const interviewType1 = await prisma.interviewType.findFirst({
    where: { name: 'HR Interview' }
  });

  const interviewType2 = await prisma.interviewType.findFirst({
    where: { name: 'Technical Interview' }
  });

  const interviewType3 = await prisma.interviewType.findFirst({
    where: { name: 'Hiring manager interview' }
  });

  // Get existing positions
  const position1 = await prisma.position.findFirst({
    where: { title: 'Senior Full-Stack Engineer' }
  });

  const position2 = await prisma.position.findFirst({
    where: { title: 'Data Scientist' }
  });

  // Get existing candidates
  const candidate1 = await prisma.candidate.findFirst({
    where: { email: 'john.doe@gmail.com' }
  });

  const candidate2 = await prisma.candidate.findFirst({
    where: { email: 'jane.smith@gmail.com' }
  });

  const candidate3 = await prisma.candidate.findFirst({
    where: { email: 'carlos.garcia@example.com' }
  });

  // Check if interview steps exist for flow 2
  const existingStepsFlow2 = await prisma.interviewStep.findMany({
    where: { interviewFlowId: interviewFlow2.id }
  });

  if (existingStepsFlow2.length === 0) {
    console.log('Adding interview steps for Data Scientist position...');
    
    // Create Interview Steps for Flow 2 (Data Scientist)
    await prisma.interviewStep.create({
      data: {
        interviewFlowId: interviewFlow2.id,
        interviewTypeId: interviewType1.id,
        name: 'HR Screening',
        orderIndex: 1,
      },
    });

    await prisma.interviewStep.create({
      data: {
        interviewFlowId: interviewFlow2.id,
        interviewTypeId: interviewType2.id,
        name: 'Data Analysis Test',
        orderIndex: 2,
      },
    });

    await prisma.interviewStep.create({
      data: {
        interviewFlowId: interviewFlow2.id,
        interviewTypeId: interviewType3.id,
        name: 'Final Interview',
        orderIndex: 3,
      },
    });
  }

  // Get interview steps for applications
  const interviewStep1 = await prisma.interviewStep.findFirst({
    where: { name: 'Initial Screening' }
  });

  const interviewStep2 = await prisma.interviewStep.findFirst({
    where: { name: 'Technical Interview' }
  });

  const interviewStep4 = await prisma.interviewStep.findFirst({
    where: { name: 'HR Screening' }
  });

  // Check if applications exist
  const existingApplications = await prisma.application.findMany();

  if (existingApplications.length === 0) {
    console.log('Adding applications...');
    
    // Create Applications with fixed realistic scores
    const application1 = await prisma.application.create({
      data: {
        candidateId: candidate1.id,
        positionId: position1.id,
        currentInterviewStep: interviewStep2.id, // Technical Interview
        averageScore: 4, // Good candidate
      },
    });

    const application2 = await prisma.application.create({
      data: {
        candidateId: candidate1.id,
        positionId: position2.id,
        currentInterviewStep: interviewStep4.id, // HR Screening
        averageScore: 3, // Average candidate
      },
    });

    const application3 = await prisma.application.create({
      data: {
        candidateId: candidate2.id,
        positionId: position1.id,
        currentInterviewStep: interviewStep2.id, // Technical Interview
        averageScore: 5, // Excellent candidate
      },
    });

    const application4 = await prisma.application.create({
      data: {
        candidateId: candidate2.id,
        positionId: position2.id,
        currentInterviewStep: interviewStep5.id, // Data Analysis Test
        averageScore: 2, // Below average candidate
      },
    });
  }

  // Asegurar un empleado para asignar entrevistas (crea uno si no hay)
  const employee = await (async () => {
    const existing = await prisma.employee.findFirst();
    if (existing) return existing;
    const company = await prisma.company.findFirst();
    return prisma.employee.create({
      data: {
        companyId: company.id,
        name: 'Seeder',
        email: `seeder+${Date.now()}@example.com`,
        role: 'HR',
      },
    });
  })();

  // Reasignar puntuaciones (1..5) a todas las aplicaciones, creando una entrevista si no existe
  const allAppsForScoring = await prisma.application.findMany({
    include: { interviews: true },
  });

  for (const app of allAppsForScoring) {
    const score = Math.floor(Math.random() * 5) + 1;

    if (app.interviews.length === 0) {
      await prisma.interview.create({
        data: {
          applicationId: app.id,
          interviewStepId: app.currentInterviewStep,
          employeeId: employee.id,
          interviewDate: new Date(),
          score,
          result: 'seeded',
          notes: 'seed incremental score',
        },
      });
    } else {
      // Si ya hay entrevistas, actualiza la primera o todas (aquí todas) con el nuevo score
      await prisma.interview.updateMany({
        where: { applicationId: app.id },
        data: { score },
      });
    }
  }

  console.log('Seed incremental completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });