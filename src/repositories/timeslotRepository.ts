import db from '../db';
import {
  ProductTimeslot,
  ProductTimeslotDetail,
  ProductTimeslotWithDetail,
} from '../types';

type NewTimeslot = Omit<ProductTimeslot, 'id' | 'created_at' | 'updated_at'>;
type NewTimeslotDetail = Omit<ProductTimeslotDetail, 'product_timeslot_id' | 'created_at' | 'updated_at'>;

export class TimeslotRepository {
  async findByProductAndDate(productId: number, date: string): Promise<ProductTimeslotWithDetail[]> {
    return db('product_timeslots')
      .leftJoin(
        'product_timeslot_details',
        'product_timeslots.id',
        'product_timeslot_details.product_timeslot_id'
      )
      .where({ 'product_timeslots.product_id': productId, 'product_timeslots.date': date })
      .orderBy('product_timeslots.start_time', 'asc')
      .select(
        'product_timeslots.*',
        'product_timeslot_details.description',
        'product_timeslot_details.provider_name',
        'product_timeslot_details.provider_id',
        'product_timeslot_details.gender',
        'product_timeslot_details.external_id'
      );
  }

  async createMany(
    timeslots: Array<{ slot: NewTimeslot; detail?: NewTimeslotDetail }>
  ): Promise<void> {
    await db.transaction(async (trx) => {
      for (const { slot, detail } of timeslots) {
        const [{ id }] = await trx('product_timeslots').insert(slot).returning('id');
        if (detail) {
          await trx('product_timeslot_details').insert({ ...detail, product_timeslot_id: id });
        }
      }
    });
  }
}

export default new TimeslotRepository();
