import type { Migration } from '../createMigrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        CREATE FUNCTION public.prevent_request_status_history_mutation()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RAISE EXCEPTION 'Request status history is append-only'
            USING ERRCODE = '55000';
        END;
        $$;
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        CREATE TRIGGER request_status_history_immutable
        BEFORE UPDATE OR DELETE OR TRUNCATE
        ON public.request_status_history
        FOR EACH STATEMENT
        EXECUTE FUNCTION public.prevent_request_status_history_mutation();
      `,
      { transaction },
    );
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
        DROP TRIGGER request_status_history_immutable
        ON public.request_status_history;
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
        DROP FUNCTION public.prevent_request_status_history_mutation();
      `,
      { transaction },
    );
  });
};