import z from 'zod';

export const deleteMediaSchema = z.object({
  Id: z.uuid(),
});

export const deleteMediaMultipleSchema = z.object({
  Ids: z.array(z.uuid()),
});

export type DeleteMediaTypeSigleInput = z.infer<typeof deleteMediaSchema>;

export type DeleteMediaTypeMultipleInput = z.infer<
  typeof deleteMediaMultipleSchema
>;
